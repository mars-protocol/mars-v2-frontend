import moment from 'moment'

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

export class PythDataFeed implements IDatafeedChartApi {
  candlesEndpoint = 'https://benchmarks.pyth.network'
  debug = false
  enabledMarketAssetDenoms: string[] = []
  batchSize = 1000

  minutesPerInterval: { [key: string]: number } = {
    '1': 1,
    '5': 5,
    '15': 15,
    '30': 30,
    '60': 60,
    '240': 60 * 4,
    '1D': 60 * 24,
    '1W': 60 * 24 * 7,
  }

  supportedResolutions = ['1', '5', '15', '30', '60', '240', 'D', 'W'] as ResolutionString[]

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
        supported_resolutions: this.supportedResolutions,
        base_name: [this.getDescription(pairName)],
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
    const to = moment().unix()
    const from = moment()
      .subtract(this.batchSize * this.minutesPerInterval[resolution], 'minute')
      .unix()

    const asset1Bars = this.queryBarData(pythFeedIds[0] ?? 'Crypto.OSMO/USD', resolution, from, to)
    const asset2Bars = this.queryBarData(pythFeedIds[1] ?? 'Crypto.ATOM/USD', resolution, from, to)

    await Promise.all([asset1Bars, asset2Bars]).then(([asset1Bars, asset2Bars]) => {
      const bars = this.combineBars(asset1Bars, asset2Bars)

      const filler = Array.from({ length: this.batchSize - bars.length }).map((_, index) => ({
        time: (bars[0]?.time || new Date().getTime()) - index * this.minutesPerInterval[resolution],
        close: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
      }))

      onResult(bars.length > this.batchSize ? bars.slice(0, this.batchSize) : [...filler, ...bars])
    })
  }

  async queryBarData(
    feedSymbol: string,
    interval: string,
    from: PeriodParams['from'],
    to: PeriodParams['to'],
  ): Promise<Bar[]> {
    const URI = new URL('/v1/shims/tradingview/history', this.candlesEndpoint)
    const params = new URLSearchParams(URI.search)

    params.append('to', to.toString())
    params.append('from', from.toString())
    params.append('resolution', interval)
    params.append('symbol', feedSymbol)
    URI.search = params.toString()

    return fetch(URI)
      .then((res) => res.json())
      .then((json) => {
        return this.resolveBarData(json)
      })
      .catch((err) => {
        if (this.debug) console.error(err)
        throw err
      })
  }

  resolveBarData(data: BarQueryData) {
    return data['t'].map((timestamp, index) => ({
      time: timestamp,
      close: data['c'][index],
      open: data['o'][index],
      high: data['h'][index],
      low: data['l'][index],
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

  getPairName(name: string) {
    if (name.includes(PAIR_SEPARATOR)) return name

    const [symbol1, symbol2] = name.split('/')

    const asset1 = ASSETS.find((asset) => asset.symbol === symbol1)
    const asset2 = ASSETS.find((asset) => asset.symbol === symbol2)
    return `${asset1?.denom}${PAIR_SEPARATOR}${asset2?.denom}`
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
