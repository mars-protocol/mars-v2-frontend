interface PythPriceData {
  price: PythConfidenceData
  ema_price: PythConfidenceData
  id: string
}

interface PythConfidenceData {
  conf: string
  expo: number
  price: string
  publish_time: number
}

interface PythUpdateExecuteMsg {
  update_price_feeds: { data: string[] }
}
