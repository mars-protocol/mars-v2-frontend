type TradeDirection = 'long' | 'short'
type PerpsPositionType = 'market' | 'limit'

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
  orderId?: string
  asset: Asset
  type: PerpsPositionType
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

type PnL =
  | 'break_even'
  | {
      profit: Coin
    }
  | {
      loss: Coin
    }

type ArrayOfAccountTriggerOrder = AccountTriggerOrder[]
interface AccountTriggerOrder {
  account_id: string
  denom: string
  keeper_fee: Coin
  order_id: string
  size: string
  trigger_price: string
}
