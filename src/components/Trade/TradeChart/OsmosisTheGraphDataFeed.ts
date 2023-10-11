import { defaultSymbolInfo } from 'components/Trade/TradeChart/constants'
import { ASSETS } from 'constants/assets'
import { ENV } from 'constants/env'
import { getAssetByDenom, getEnabledMarketAssets } from 'utils/assets'
import {
  Bar,
  ErrorCallback,
  HistoryCallback,
  IDatafeedChartApi,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
} from 'utils/charting_library'
import { BN } from 'utils/helpers'

interface BarQueryData {
  close: string
  high: string
  low: string
  open: string
  timestamp: string
  volume: string
}

export const PAIR_SEPARATOR = '<>'

export class OsmosisTheGraphDataFeed implements IDatafeedChartApi {
  candlesEndpoint = ENV.CANDLES_ENDPOINT
  debug = false
  exchangeName = 'Osmosis'
  baseDecimals: number = 6
  baseDenom: string = 'uosmo'
  batchSize = 1000
  enabledMarketAssetDenoms: string[] = []
  pairs: { baseAsset: string; quoteAsset: string }[] = []
  pairsWithData: string[] = []
  intervals: { [key: string]: string } = {
    '15': '15m',
    '30': '30m',
    '60': '1h',
  }

  supportedPools: string[] = []
  supportedResolutions = ['15', '30', '60'] as ResolutionString[]

  constructor(debug = false, baseDecimals: number, baseDenom: string) {
    if (debug) console.log('Start TheGraph charting library datafeed')
    this.debug = debug
    this.baseDecimals = baseDecimals
    this.baseDenom = baseDenom
    const enabledMarketAssets = getEnabledMarketAssets()
    this.enabledMarketAssetDenoms = enabledMarketAssets.map((asset) => asset.mainnetDenom)
    this.supportedPools = enabledMarketAssets
      .map((asset) => asset.poolId?.toString())
      .filter((poolId) => typeof poolId === 'string') as string[]
  }

  getDescription(pairName: string) {
    const denom1 = pairName.split(PAIR_SEPARATOR)[0]
    const denom2 = pairName.split(PAIR_SEPARATOR)[1]
    const asset1 = ASSETS.find((asset) => asset.mainnetDenom === denom1)
    const asset2 = ASSETS.find((asset) => asset.mainnetDenom === denom2)
    return `${asset1?.symbol}/${asset2?.symbol}`
  }

  async getPairsWithData() {
    const query = `
      {
        pairs(first: ${this.batchSize}, 
            orderBy: symbol, 
            orderDirection: asc, 
            where: {
              baseAsset_in: ${JSON.stringify(this.enabledMarketAssetDenoms)}, 
              quoteAsset_in: ${JSON.stringify(this.enabledMarketAssetDenoms)}, 
              poolId_in: ${JSON.stringify(this.supportedPools)}
            }
        ) {
          baseAsset
          quoteAsset
        }
      }`

    return fetch(this.candlesEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((json) => {
        this.pairs = json.data.pairs
        this.pairsWithData = json.data.pairs.map(
          (pair: { baseAsset: string; quoteAsset: string }) => {
            return `${pair.baseAsset}${PAIR_SEPARATOR}${pair.quoteAsset}`
          },
        )
      })
      .catch((err) => {
        if (this.debug) console.error(err)
        throw err
      })
  }

  onReady(callback: OnReadyCallback) {
    const configurationData = {
      supported_resolutions: this.supportedResolutions,
    }

    setTimeout(async () => {
      await this.getPairsWithData()
      callback(configurationData)
    })
  }

  async resolveSymbol(pairName: string, onResolve: ResolveCallback, onError: ErrorCallback) {
    setTimeout(() =>
      onResolve({
        ...defaultSymbolInfo,
        name: this.getDescription(pairName),
        full_name: pairName,
        description: this.getDescription(pairName),
        ticker: this.getDescription(pairName),
        exchange: this.exchangeName,
        listed_exchange: this.exchangeName,
        supported_resolutions: this.supportedResolutions,
      }),
    )
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
  ): Promise<void> {
    const interval = this.intervals[resolution]

    let pair1 = symbolInfo.full_name
    let pair2: string = ''
    let pair3: string = ''

    if (!this.pairsWithData.includes(pair1)) {
      if (this.debug) console.log('Pair does not have data, need to combine with other pairs')

      const [buyAssetDenom, sellAssetDenom] = pair1.split(PAIR_SEPARATOR)

      const pair1Pools = this.pairs.filter((pair) => pair.baseAsset === buyAssetDenom)
      const pair2Pools = this.pairs.filter((pair) => pair.quoteAsset === sellAssetDenom)

      const matchedPools = pair1Pools.filter((pool) => {
        const asset = pool.quoteAsset
        return !!pair2Pools.find((pool) => pool.baseAsset === asset)
      })

      if (matchedPools.length) {
        pair1 = `${buyAssetDenom}${PAIR_SEPARATOR}${matchedPools[0].quoteAsset}`
        pair2 = `${matchedPools[0].quoteAsset}${PAIR_SEPARATOR}${sellAssetDenom}`
      } else {
        const middlePair = this.pairs.filter(
          (pair) =>
            pair1Pools.map((pairs) => pairs.quoteAsset).includes(pair.baseAsset) &&
            pair2Pools.map((pairs) => pairs.baseAsset).includes(pair.quoteAsset),
        )

        pair1 = `${buyAssetDenom}${PAIR_SEPARATOR}${middlePair[0].baseAsset}`
        pair2 = `${middlePair[0].baseAsset}${PAIR_SEPARATOR}${middlePair[0].quoteAsset}`
        pair3 = `${middlePair[0].quoteAsset}${PAIR_SEPARATOR}${sellAssetDenom}`
      }
    }

    const pair1Bars = this.queryBarData(
      pair1.split(PAIR_SEPARATOR)[0],
      pair1.split(PAIR_SEPARATOR)[1],
      interval,
    )

    let pair2Bars: Promise<Bar[]> | null = null

    if (pair2) {
      pair2Bars = this.queryBarData(
        pair2.split(PAIR_SEPARATOR)[0],
        pair2.split(PAIR_SEPARATOR)[1],
        interval,
      )
    }

    let pair3Bars: Promise<Bar[]> | null = null

    if (pair3) {
      pair3Bars = this.queryBarData(
        pair3.split(PAIR_SEPARATOR)[0],
        pair3.split(PAIR_SEPARATOR)[1],
        interval,
      )
    }

    await Promise.all([pair1Bars, pair2Bars, pair3Bars]).then(
      ([pair1Bars, pair2Bars, pair3Bars]) => {
        let bars = pair1Bars
        if (pair2Bars) {
          bars = this.combineBars(pair1Bars, pair2Bars)
        }
        if (pair3Bars) {
          bars = this.combineBars(bars, pair3Bars)
        }
        onResult(bars)
      },
    )
  }

  async queryBarData(quote: string, base: string, interval: string): Promise<Bar[]> {
    const query = `
        {
            candles(
            first: ${this.batchSize},
            orderBy: "timestamp",
            orderDirection: "desc",
                where: {
                  interval: "${interval}",
                  quote: "${quote}",
                  base: "${base}"
                  poolId_in: ${JSON.stringify(this.supportedPools)}
                  }
                ) {
                    timestamp
                    open
                    high
                    low
                    close
                    volume
            }
        }
    `

    return fetch(this.candlesEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((json: { data?: { candles: BarQueryData[] } }) => {
        return this.resolveBarData(json.data?.candles.reverse() || [], base, quote)
      })
      .catch((err) => {
        if (this.debug) console.error(err)
        throw err
      })
  }

  resolveBarData(bars: BarQueryData[], toDenom: string, fromDenom: string) {
    const toDecimals = getAssetByDenom(toDenom)?.decimals || 6
    const fromDecimals = getAssetByDenom(fromDenom)?.decimals || 6
    const additionalDecimals = toDecimals - fromDecimals

    return bars.map((bar) => ({
      time: BN(bar.timestamp).multipliedBy(1000).toNumber(),
      close: BN(bar.close).shiftedBy(additionalDecimals).toNumber(),
      open: BN(bar.open).shiftedBy(additionalDecimals).toNumber(),
      high: BN(bar.high).shiftedBy(additionalDecimals).toNumber(),
      low: BN(bar.low).shiftedBy(additionalDecimals).toNumber(),
      volume: BN(bar.volume).shiftedBy(additionalDecimals).toNumber(),
    }))
  }

  combineBars(pair1Bars: Bar[], pair2Bars: Bar[]): Bar[] {
    const bars: Bar[] = []

    pair1Bars.forEach((pair1Bar) => {
      const pair2Bar = pair2Bars.find((pair2Bar) => pair2Bar.time == pair1Bar.time)

      if (pair2Bar) {
        bars.push({
          time: pair1Bar.time,
          open: pair1Bar.open * pair2Bar.open,
          close: pair1Bar.close * pair2Bar.close,
          high: pair1Bar.high * pair2Bar.high,
          low: pair1Bar.low * pair2Bar.low,
        })
      }
    })
    return bars
  }

  searchSymbols(): void {
    // Don't allow to search for symbols
  }

  subscribeBars(): void {
    // TheGraph doesn't support websockets yet
  }

  unsubscribeBars(listenerGuid: string): void {
    // TheGraph doesn't support websockets yet
  }
}
