type TradeDirection = 'long' | 'short'

// TODO: 📈Remove this type when healthcomputer is implemented
type PositionsWithoutPerps = Omit<
  import('types/generated/mars-credit-manager/MarsCreditManager.types').Positions,
  'perps'
>

interface PerpsPosition {
  denom: string
  baseDenom: string
  tradeDirection: TradeDirection
  amount: BigNumber
  closingFee: BNCoin
  pnl: PerpsPnL
  entryPrice: BigNumber
}

interface PerpPositionRow extends PerpsPosition {
  asset: Asset
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
