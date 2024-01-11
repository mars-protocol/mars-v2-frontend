import {
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from 'utils/charting_library/charting_library'

const streamingUrl = 'https://benchmarks.pyth.network/v1/shims/tradingview/streaming'
const channelToSubscription = new Map()

function handleStreamingData(data: StreamData) {
  const { id, p, t } = data

  const tradePrice = p
  const tradeTime = t * 1000

  const channelString = id
  const subscriptionItem = channelToSubscription.get(channelString)

  if (!subscriptionItem) {
    return
  }

  const lastDailyBar = subscriptionItem.lastDailyBar

  if (!lastDailyBar) {
    subscriptionItem.lastDailyBar = {
      time: tradeTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    }
  }

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
              // console.error('[stream] Streaming ended.')
              return
            }

            // Assuming the streaming data is separated by line breaks
            const dataStrings = new TextDecoder().decode(value).split('\n')
            dataStrings.forEach((dataString) => {
              const trimmedDataString = dataString.trim()
              if (trimmedDataString) {
                try {
                  var jsonData = JSON.parse(trimmedDataString)
                  handleStreamingData(jsonData)
                } catch (e) {
                  if (e instanceof Error) {
                    // console.error('Error parsing JSON:', e.message)
                  }
                }
              }
            })

            streamData() // Continue processing the stream
          })
          .catch((error) => {
            // console.error('[stream] Error reading from stream:', error)
            attemptReconnect(retries, delay)
          })
      }

      streamData()
    })
    .catch((error) => {
      // console.error('[stream] Error fetching from the streaming endpoint:', error)
    })
  function attemptReconnect(retriesLeft: number, delay: number) {
    if (retriesLeft > 0) {
      // console.log(`[stream] Attempting to reconnect in ${delay}ms...`)
      setTimeout(() => {
        startStreaming(retriesLeft - 1, delay)
      }, delay)
    } else {
      // console.error('[stream] Maximum reconnection attempts reached.')
    }
  }
}

function getNextDailyBarTime(barTime: number) {
  const date = new Date(barTime * 1000)
  date.setDate(date.getDate() + 1000)
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
  const channelString = symbolInfo.name
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
