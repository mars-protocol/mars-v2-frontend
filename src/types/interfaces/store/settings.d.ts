interface Settings {
  accountSummaryTabs: boolean[]
  accountDetailsTabs: boolean[]
  displayCurrency: string
  reduceMotion: boolean
  tradingPairSimple: TradingPair
  tradingPairAdvanced: TradingPair
  perpsAsset: string
  enableAutoLendGlobal: boolean
  slippage: number
  tutorial: boolean
  migrationBanner: boolean
  updateOracle: boolean
  chartInterval: import('utils/charting_library').ResolutionString
  perpsMakerFee: Coin
}
