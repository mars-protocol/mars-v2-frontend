import { pythEndpoints } from 'constants/pyth'
import {
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from 'utils/charting_library/charting_library'

const streamingUrl = `${pythEndpoints.candles}/streaming`
const channelToSubscription = new Map()
let isStreamingActive = false
let streamReader: ReadableStreamDefaultReader<Uint8Array> | null = null
let lastDataReceivedTime = Date.now()
let heartbeatInterval: NodeJS.Timeout | null = null

function handleStreamingData(data: StreamData) {
  const { id, p, t } = data

  // Update last data received time for heartbeat monitoring
  lastDataReceivedTime = Date.now()

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

function startHeartbeatMonitor() {
  // Clear existing interval if any
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }

  // Check every 30 seconds if we've received data recently
  heartbeatInterval = setInterval(() => {
    const timeSinceLastData = Date.now() - lastDataReceivedTime
    // If no data received for 60 seconds and we have active subscriptions, restart stream
    if (timeSinceLastData > 60000 && channelToSubscription.size > 0 && isStreamingActive) {
      // console.log('No data received for 60 seconds, restarting stream...')
      isStreamingActive = false
      if (streamReader) {
        streamReader.cancel()
        streamReader = null
      }
      startStreaming()
    }
  }, 30000)
}

function stopHeartbeatMonitor() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

function startStreaming(retries = 3, delay = 3000) {
  // Prevent multiple concurrent streams
  if (isStreamingActive) {
    return
  }

  // Cancel existing reader if any
  if (streamReader) {
    streamReader.cancel()
    streamReader = null
  }

  isStreamingActive = true
  lastDataReceivedTime = Date.now()

  // Start heartbeat monitoring
  startHeartbeatMonitor()

  fetch(streamingUrl)
    .then((response) => {
      if (response.body === null) {
        isStreamingActive = false
        stopHeartbeatMonitor()
        return
      }
      const reader = response.body.getReader()
      streamReader = reader

      function streamData() {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              // console.error('Streaming ended.')
              isStreamingActive = false
              streamReader = null
              stopHeartbeatMonitor()
              // Reconnect when stream ends naturally
              if (channelToSubscription.size > 0) {
                attemptReconnect(retries, delay)
              }
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
            isStreamingActive = false
            streamReader = null
            stopHeartbeatMonitor()
            attemptReconnect(retries, delay)
          })
      }

      streamData()
    })
    .catch((error) => {
      // console.error('Error fetching from the streaming endpoint:', error)
      isStreamingActive = false
      streamReader = null
      stopHeartbeatMonitor()
      attemptReconnect(retries, delay)
    })

  function attemptReconnect(retriesLeft: number, delay: number) {
    if (retriesLeft > 0 && channelToSubscription.size > 0) {
      setTimeout(() => {
        startStreaming(retriesLeft - 1, delay)
      }, delay)
    } else {
      // console.error('Maximum reconnection attempts reached.')
      isStreamingActive = false
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

  if (subscriptionItem) {
    // Add handler to existing subscription
    subscriptionItem.handlers.push(handler)
    subscriptionItem.lastDailyBar = lastDailyBar
  } else {
    // Create new subscription
    subscriptionItem = {
      subscriberUID,
      resolution,
      lastDailyBar,
      handlers: [handler],
    }
  }

  channelToSubscription.set(channelString, subscriptionItem)

  // Only start streaming if not already active
  if (!isStreamingActive) {
    startStreaming()
  }
}

export function unsubscribeFromStream(subscriberUID: string) {
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString)
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler: any) => handler.id === subscriberUID,
    )

    if (handlerIndex !== -1) {
      // Remove the specific handler
      subscriptionItem.handlers.splice(handlerIndex, 1)

      // If no more handlers, delete the subscription
      if (subscriptionItem.handlers.length === 0) {
        channelToSubscription.delete(channelString)
      }
      break
    }
  }

  // If no more subscriptions, stop streaming
  if (channelToSubscription.size === 0) {
    if (streamReader) {
      streamReader.cancel()
      streamReader = null
    }
    isStreamingActive = false
    stopHeartbeatMonitor()
  }
}

// Handle browser tab visibility changes to restart stream when tab becomes active
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && channelToSubscription.size > 0 && !isStreamingActive) {
      // Tab became visible and we have subscriptions but streaming is not active
      // Restart the stream
      startStreaming()
    }
  })
}
