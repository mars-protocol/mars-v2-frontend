import { defaultSymbolInfo } from 'components/Trade/TradeChart/constants'
import { ASSETS } from 'constants/assets'
import { getEnabledMarketAssets } from 'utils/assets'
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

interface BarQueryData {
  s: string
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

export const PAIR_SEPARATOR = '<>'
const MILLISECONDS_PER_MINUTE = 60000

export class PythDataFeed implements IDatafeedChartApi {
  candlesEndpoint = 'https://benchmarks.pyth.network'
  debug = false
  enabledMarketAssetDenoms: string[] = []
  batchSize = 1000
  exchangeName = 'Pyth Oracle'
  millisecondsPerInterval: { [key: string]: number } = {
    '1': MILLISECONDS_PER_MINUTE,
    '5': MILLISECONDS_PER_MINUTE * 5,
    '15': MILLISECONDS_PER_MINUTE * 15,
    '30': MILLISECONDS_PER_MINUTE * 30,
    '60': MILLISECONDS_PER_MINUTE * 60,
    '240': MILLISECONDS_PER_MINUTE * 240,
    '1D': MILLISECONDS_PER_MINUTE * 1440,
  }

  supportedResolutions = ['1', '5', '15', '30', '60', '240', 'D'] as ResolutionString[]

  constructor(debug = false) {
    if (debug) console.log('Start Pyth charting library datafeed')
    this.debug = debug
    const enabledMarketAssets = getEnabledMarketAssets()
    this.enabledMarketAssetDenoms = enabledMarketAssets.map((asset) => asset.mainnetDenom)
  }

  getDescription(pairName: string) {
    const denom1 = pairName.split(PAIR_SEPARATOR)[0]
    const denom2 = pairName.split(PAIR_SEPARATOR)[1]
    const asset1 = ASSETS.find((asset) => asset.mainnetDenom === denom1)
    const asset2 = ASSETS.find((asset) => asset.mainnetDenom === denom2)
    return `${asset1?.symbol}/${asset2?.symbol}`
  }

  onReady(callback: OnReadyCallback) {
    const configurationData = {
      supported_resolutions: this.supportedResolutions,
    }

    setTimeout(async () => {
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
        exchange: this.exchangeName,
        listed_exchange: this.exchangeName,
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

    if (!pythFeedId1 || !pythFeedId2) return onResult([], { noData: true })

    const asset1Bars = this.queryBarData(pythFeedId1, resolution, from, to)
    const asset2Bars = this.queryBarData(pythFeedId2, resolution, from, to)

    await Promise.all([asset1Bars, asset2Bars]).then(([asset1Bars, asset2Bars]) => {
      const bars = this.combineBars(asset1Bars, asset2Bars)

      onResult(bars)
    })
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

  resolveBarData(data: BarQueryData, resolution: ResolutionString, to: number) {
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
    const asset2 = ASSETS.find((asset) => asset.mainnetDenom === denoms[1])
    const decimalsOut = asset2?.decimals ?? 6
    return BN(1)
      .shiftedBy(decimalsOut > 8 ? 8 : decimalsOut)
      .toNumber()
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
