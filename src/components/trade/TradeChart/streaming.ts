import { pythEndpoints } from '../../../constants/pyth'
import {
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../utils/charting_library/charting_library'

const streamingUrl = `${pythEndpoints.candles}/streaming`
const channelToSubscription = new Map()

function handleStreamingData(data: StreamData) {
  const { id, p, t } = data

  const tradePrice = p
  const tradeTime = t * 1000 // Multiplying by 1000 to get milliseconds

  const channelString = id
  const subscriptionItem = channelToSubscription.get(channelString)

  if (!subscriptionItem) {
    return
  }

  const lastDailyBar = subscriptionItem.lastDailyBar
  const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time)

  let bar: Bar
  if (tradeTime >= nextDailyBarTime) {
    bar = {
      time: nextDailyBarTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    }
  } else {
    bar = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar.high, tradePrice),
      low: Math.min(lastDailyBar.low, tradePrice),
      close: tradePrice,
    }
  }

  subscriptionItem.lastDailyBar = bar

  // Send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler: any) => handler.callback(bar))
  channelToSubscription.set(channelString, subscriptionItem)
}

function startStreaming(retries = 3, delay = 3000) {
  fetch(streamingUrl)
    .then((response) => {
      if (response.body === null) return
      const reader = response.body.getReader()

      function streamData() {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              // console.error('Streaming ended.')
              return
            }

            const dataStrings = new TextDecoder().decode(value).split('\n')
            dataStrings.forEach((dataString) => {
              const trimmedDataString = dataString.trim()
              if (trimmedDataString) {
                try {
                  const jsonData = JSON.parse(trimmedDataString)
                  handleStreamingData(jsonData)
                } catch (e) {
                  if (e instanceof Error) {
                    // console.error('Error parsing JSON:', e.message)
                  }
                }
              }
            })

            streamData()
          })
          .catch((error) => {
            // console.error('Error reading from stream:', error)
            attemptReconnect(retries, delay)
          })
      }

      streamData()
    })
    .catch((error) => {
      // console.error('Error fetching from the streaming endpoint:', error)
    })
  function attemptReconnect(retriesLeft: number, delay: number) {
    if (retriesLeft > 0) {
      setTimeout(() => {
        startStreaming(retriesLeft - 1, delay)
      }, delay)
    } else {
      // console.error('Maximum reconnection attempts reached.')
    }
  }
}

function getNextDailyBarTime(barTime: number) {
  const date = new Date(barTime * 1000)
  date.setDate(date.getDate() + 1)
  return date.getTime() / 1000
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastDailyBar: Bar,
) {
  const channelString = symbolInfo.ticker
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  }
  let subscriptionItem = channelToSubscription.get(channelString)
  subscriptionItem = {
    subscriberUID,
    resolution,
    lastDailyBar,
    handlers: [handler],
  }
  channelToSubscription.set(channelString, subscriptionItem)
  startStreaming()
}

export function unsubscribeFromStream(subscriberUID: string) {
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString)
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler: any) => handler.id === subscriberUID,
    )

    if (handlerIndex !== -1) {
      channelToSubscription.delete(channelString)
      break
    }
  }
}
