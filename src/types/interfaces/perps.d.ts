type TradeDirection = 'long' | 'short'
type PerpsPositionStatus = 'active' | 'pending'

interface PerpsPosition {
  denom: string
  baseDenom: string
  tradeDirection: TradeDirection
  amount: BigNumber
  pnl: PerpsPnL
  currentPrice: BigNumber
  entryPrice: BigNumber
  closingFeeRate: BigNumber
}

interface PerpPositionRow extends PerpsPosition {
  asset: Asset
  status: PerpsPositionStatus
  liquidationPrice: BigNumber
  leverage: number
}

interface PerpsPnL {
  net: BNCoin
  realized: PerpsPnLCoins
  unrealized: PerpsPnLCoins
}

interface PerpsPnLCoins {
  fees: BNCoin
  funding: BNCoin
  net: BNCoin
  price: BNCoin
}

interface PerpsPnL {
  net: BNCoin
  realized: PerpsPnLCoins
  unrealized: PerpsPnLCoins
}

interface PerpsPnLCoins {
  fees: BNCoin
  funding: BNCoin
  net: BNCoin
  price: BNCoin
}

type PerpsTransactionType = 'open' | 'close' | 'modify'
