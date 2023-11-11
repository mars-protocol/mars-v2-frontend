import { defaultSymbolInfo } from 'components/Trade/TradeChart/constants'
import { ASSETS } from 'constants/assets'
import { ENV } from 'constants/env'
import { MILLISECONDS_PER_MINUTE } from 'constants/math'
import { byDenom } from 'utils/array'
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
import { devideByPotentiallyZero } from 'utils/math'

interface PythBarQueryData {
  s: string
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

interface TheGraphBarQueryData {
  close: string
  high: string
  low: string
  open: string
  timestamp: string
  volume: string
}

export const PAIR_SEPARATOR = '<>'

export class DataFeed implements IDatafeedChartApi {
  candlesEndpoint = ENV.CANDLES_ENDPOINT_PYTH
  candlesEndpointTheGraph = ENV.CANDLES_ENDPOINT_THE_GRAPH
  debug = false
  enabledMarketAssetDenoms: string[] = []
  batchSize = 1000
  baseDecimals: number = 6
  baseDenom: string = 'uosmo'
  intervalsTheGraph: { [key: string]: string } = {
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '240': '4h',
    '1D': '1d',
  }
  millisecondsPerInterval: { [key: string]: number } = {
    '15': MILLISECONDS_PER_MINUTE * 15,
    '30': MILLISECONDS_PER_MINUTE * 30,
    '60': MILLISECONDS_PER_MINUTE * 60,
    '240': MILLISECONDS_PER_MINUTE * 240,
    '1D': MILLISECONDS_PER_MINUTE * 1440,
  }
  pairs: { baseAsset: string; quoteAsset: string }[] = []
  pairsWithData: string[] = []
  supportedPools: string[] = []
  supportedResolutions = ['15', '30', '60', '240', 'D'] as ResolutionString[]

  constructor(debug = false, baseDecimals: number, baseDenom: string) {
    if (debug) console.log('Start charting library datafeed')
    this.debug = debug
    this.baseDecimals = baseDecimals
    this.baseDenom = baseDenom
    const enabledMarketAssets = getEnabledMarketAssets()
    this.enabledMarketAssetDenoms = enabledMarketAssets.map((asset) => asset.denom)
    this.supportedPools = enabledMarketAssets
      .map((asset) => asset.poolId?.toString())
      .filter((poolId) => typeof poolId === 'string') as string[]
  }

  getDescription(pairName: string) {
    const denom1 = pairName.split(PAIR_SEPARATOR)[0]
    const denom2 = pairName.split(PAIR_SEPARATOR)[1]
    const asset1 = ASSETS.find(byDenom(denom1))
    const asset2 = ASSETS.find(byDenom(denom2))
    return `${asset2?.symbol}/${asset1?.symbol}`
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

    return fetch(this.candlesEndpointTheGraph, {
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

  resolveSymbol(pairName: string, onResolve: ResolveCallback, onError: ErrorCallback) {
    pairName = this.getPairName(pairName)
    setTimeout(() => {
      const info: LibrarySymbolInfo = {
        ...defaultSymbolInfo,
        name: this.getDescription(pairName),
        full_name: this.getDescription(pairName),
        description: this.getDescription(pairName),
        ticker: this.getDescription(pairName),
        exchange: this.getExchangeName(pairName),
        listed_exchange: this.getExchangeName(pairName),
        supported_resolutions: this.supportedResolutions,
        base_name: [this.getDescription(pairName)],
        pricescale: this.getPriceScale(pairName),
      } as LibrarySymbolInfo
      onResolve(info)
    })
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
  ): Promise<void> {
    try {
      let bars = [] as Bar[]
      const pythFeedIds = this.getPythFeedIds(symbolInfo.full_name)
      const now = new Date().getTime()
      const to = BN(now).dividedBy(1000).integerValue().toNumber()
      const from = BN(now)
        .minus(this.batchSize * this.millisecondsPerInterval[resolution])
        .dividedBy(1000)
        .integerValue()
        .toNumber()
      const pythFeedId1 = pythFeedIds[0]
      const pythFeedId2 = pythFeedIds[1]

      if (pythFeedId1 && pythFeedId2) {
        const asset1Bars = this.queryBarData(pythFeedId1, resolution, from, to)
        const asset2Bars = this.queryBarData(pythFeedId2, resolution, from, to)

        await Promise.all([asset1Bars, asset2Bars]).then(([asset1Bars, asset2Bars]) => {
          bars = this.combineBars(asset1Bars, asset2Bars)
          onResult(bars)
        })
      } else {
        await this.getBarsFromTheGraph(symbolInfo, resolution, to).then((bars) => onResult(bars))
      }
    } catch (error) {
      console.error(error)
      return onResult([], { noData: true })
    }
  }

  async getBarsFromTheGraph(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    to: number,
  ) {
    let pair1 = this.getPairName(symbolInfo.full_name)
    let pair2: string = ''
    let pair3: string = ''
    let theGraphBars = [] as Bar[]

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

    const pair1Bars = this.queryBarDataTheGraph(
      pair1.split(PAIR_SEPARATOR)[0],
      pair1.split(PAIR_SEPARATOR)[1],
      resolution,
      to,
    )

    let pair2Bars: Promise<Bar[]> | null = null

    if (pair2) {
      pair2Bars = this.queryBarDataTheGraph(
        pair2.split(PAIR_SEPARATOR)[0],
        pair2.split(PAIR_SEPARATOR)[1],
        resolution,
        to,
      )
    }

    let pair3Bars: Promise<Bar[]> | null = null

    if (pair3) {
      pair3Bars = this.queryBarDataTheGraph(
        pair3.split(PAIR_SEPARATOR)[0],
        pair3.split(PAIR_SEPARATOR)[1],
        resolution,
        to,
      )
    }

    await Promise.all([pair1Bars, pair2Bars, pair3Bars]).then(
      ([pair1Bars, pair2Bars, pair3Bars]) => {
        let bars = pair1Bars

        if (!bars.length) {
          return
        }

        if (pair2Bars) {
          bars = this.combineBars(pair1Bars, pair2Bars)
        }
        if (pair3Bars) {
          bars = this.combineBars(bars, pair3Bars)
        }

        const filler = Array.from({ length: this.batchSize - bars.length }).map((_, index) => ({
          time:
            (bars[0]?.time || new Date().getTime()) -
            (index * this.millisecondsPerInterval[resolution]) / 1000,
          close: 0,
          open: 0,
          high: 0,
          low: 0,
          volume: 0,
        }))
        theGraphBars = [...filler, ...bars]
      },
    )

    return theGraphBars
  }

  async queryBarData(
    feedSymbol: string,
    resolution: ResolutionString,
    from: PeriodParams['from'],
    to: PeriodParams['to'],
  ): Promise<Bar[]> {
    const URI = new URL('/v1/shims/tradingview/history', this.candlesEndpoint)
    const params = new URLSearchParams(URI.search)

    params.append('to', to.toString())
    params.append('from', from.toString())
    params.append('resolution', resolution)
    params.append('symbol', feedSymbol)
    URI.search = params.toString()

    return fetch(URI)
      .then((res) => res.json())
      .then((json) => {
        return this.resolveBarData(json, resolution, to)
      })
      .catch((err) => {
        if (this.debug) console.error(err)
        throw err
      })
  }

  async queryBarDataTheGraph(
    quote: string,
    base: string,
    resolution: ResolutionString,
    to: PeriodParams['to'],
  ): Promise<Bar[]> {
    const interval = this.intervalsTheGraph[resolution]

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

    return fetch(this.candlesEndpointTheGraph, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((json: { data?: { candles: TheGraphBarQueryData[] } }) => {
        return this.resolveBarDataTheGraph(
          json.data?.candles.reverse() || [],
          base,
          quote,
          resolution,
          to,
        )
      })
      .catch((err) => {
        if (this.debug) console.error(err)
        throw err
      })
  }

  resolveBarData(data: PythBarQueryData, resolution: ResolutionString, to: number) {
    let barData = [] as Bar[]

    if (data['s'] === 'ok') {
      barData = data['t'].map((timestamp, index) => ({
        time: timestamp * 1000,
        close: data['c'][index],
        open: data['o'][index],
        high: data['h'][index],
        low: data['l'][index],
      }))
    }

    return this.fillBarData(barData, resolution, to)
  }

  resolveBarDataTheGraph(
    bars: TheGraphBarQueryData[],
    toDenom: string,
    fromDenom: string,
    resolution: ResolutionString,
    to: number,
  ) {
    let barData = [] as Bar[]
    const toDecimals = getAssetByDenom(toDenom)?.decimals || 6
    const fromDecimals = getAssetByDenom(fromDenom)?.decimals || 6
    const additionalDecimals = toDecimals - fromDecimals

    barData = bars.map((bar) => ({
      time: BN(bar.timestamp).multipliedBy(1000).toNumber(),
      close: BN(bar.close).shiftedBy(additionalDecimals).toNumber(),
      open: BN(bar.open).shiftedBy(additionalDecimals).toNumber(),
      high: BN(bar.high).shiftedBy(additionalDecimals).toNumber(),
      low: BN(bar.low).shiftedBy(additionalDecimals).toNumber(),
      volume: BN(bar.volume).shiftedBy(additionalDecimals).toNumber(),
    }))

    return this.fillBarData(barData, resolution, to)
  }

  fillBarData(barData: Bar[], resolution: ResolutionString, to: number) {
    if (barData.length < this.batchSize) {
      const filler = Array.from({ length: this.batchSize - barData.length }).map((_, index) => ({
        time: (barData[0]?.time || to) - index * this.millisecondsPerInterval[resolution],
        close: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
      }))

      barData = [...filler, ...barData]
    }

    return barData.length > this.batchSize ? barData.slice(0, this.batchSize) : barData
  }

  combineBars(pair1Bars: Bar[], pair2Bars: Bar[]): Bar[] {
    const bars: Bar[] = []

    pair1Bars.forEach((pair1Bar, index) => {
      const pair2Bar = pair2Bars[index]

      bars.push({
        time: pair1Bar.time,
        open: devideByPotentiallyZero(pair1Bar.open, pair2Bar.open),
        close: devideByPotentiallyZero(pair1Bar.close, pair2Bar.close),
        high: devideByPotentiallyZero(pair1Bar.high, pair2Bar.high),
        low: devideByPotentiallyZero(pair1Bar.low, pair2Bar.low),
      })
    })
    return bars
  }

  getPairName(name: string) {
    if (name.includes(PAIR_SEPARATOR)) return name

    const [symbol1, symbol2] = name.split('/')

    const asset1 = ASSETS.find((asset) => asset.symbol === symbol1)
    const asset2 = ASSETS.find((asset) => asset.symbol === symbol2)
    return `${asset1?.denom}${PAIR_SEPARATOR}${asset2?.denom}`
  }

  getPriceScale(name: string) {
    const denoms = name.split(PAIR_SEPARATOR)
    const asset2 = ASSETS.find(byDenom(denoms[1]))
    const decimalsOut = asset2?.decimals ?? 6
    return BN(1)
      .shiftedBy(decimalsOut > 8 ? 8 : decimalsOut)
      .toNumber()
  }

  getExchangeName(name: string) {
    const denoms = name.split(PAIR_SEPARATOR)
    const pythFeedId1 = ASSETS.find(byDenom(denoms[0]))?.pythHistoryFeedId
    const pythFeedId2 = ASSETS.find(byDenom(denoms[1]))?.pythHistoryFeedId
    if (!pythFeedId1 || !pythFeedId2) return 'Osmosis'
    return 'Pyth Oracle'
  }

  getPythFeedIds(name: string) {
    if (name.includes(PAIR_SEPARATOR)) return []
    const [symbol1, symbol2] = name.split('/')
    const feedId1 = ASSETS.find((asset) => asset.symbol === symbol1)?.pythHistoryFeedId
    const feedId2 = ASSETS.find((asset) => asset.symbol === symbol2)?.pythHistoryFeedId

    return [feedId1, feedId2]
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
