import { subscribeOnStream, unsubscribeFromStream } from 'components/trade/TradeChart/streaming'
import { pythEndpoints } from 'constants/pyth'
import { FETCH_TIMEOUT } from 'constants/query'
import {
  HistoryCallback,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  SymbolResolveExtension,
} from 'utils/charting_library'
import { fetchWithTimeout } from 'utils/fetch'

const lastBarsCache = new Map()

export const datafeed = {
  onReady: (callback: OnReadyCallback) =>
    setTimeout(() => {
      callback({
        supported_resolutions: [
          '1',
          '2',
          '5',
          '15',
          '30',
          '60',
          '120',
          '240',
          '360',
          '720',
          'D',
          '1D',
        ] as ResolutionString[],
        supports_marks: true,
        supports_timescale_marks: false,
      })
    }, 0),
  getBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onHistoryCallback: HistoryCallback,
    onErrorCallback: DatafeedErrorCallback,
  ) => {
    const { from, to, firstDataRequest } = periodParams
    fetchWithTimeout(
      `${pythEndpoints.candles}/history?symbol=${symbolInfo.ticker}&from=${from}&to=${to}&resolution=${resolution}`,
      FETCH_TIMEOUT,
    ).then((response) => {
      response
        .json()
        .then((data) => {
          if (data.errmsg) {
            onHistoryCallback([], { noData: true })
            return
          }
          if (data.t.length === 0) {
            onHistoryCallback([], { noData: true })
            return
          }
          const bars = []
          for (let i = 0; i < data.t.length; ++i) {
            bars.push({
              time: data.t[i] * 1000,
              low: data.l[i],
              high: data.h[i],
              open: data.o[i],
              close: data.c[i],
            })
          }
          if (firstDataRequest) {
            lastBarsCache.set(symbolInfo.ticker, {
              ...bars[bars.length - 1],
            })
          }
          onHistoryCallback(bars, { noData: false })
        })
        .catch((error) => {
          onErrorCallback(error)
        })
    })
  },
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
  ): void {
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.ticker),
    )
  },
  unsubscribeBars(subscriberUID: string) {
    unsubscribeFromStream(subscriberUID)
  },
  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback,
  ) => {
    return
  },
  resolveSymbol: (
    symbolName: string,
    onResolve: ResolveCallback,
    onError: DatafeedErrorCallback,
    extension?: SymbolResolveExtension,
  ) => {
    try {
      fetch(`${pythEndpoints.candles}/symbols?symbol=Crypto.${symbolName.toUpperCase()}`).then(
        (response) => {
          response
            .json()
            .then((symbolInfo) => {
              if (symbolInfo.errmsg) {
                symbolInfo.description = symbolName
              } else {
                symbolInfo.description = symbolInfo.ticker.split('Crypto.')[1]
              }
              onResolve(symbolInfo)
            })
            .catch((error) => {
              console.error(error)
              return
            })
        },
      )
    } catch (error) {
      console.error(error)
      return
    }
  },
}
