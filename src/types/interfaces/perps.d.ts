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
  pnl: PerpsPnL & { net: BNCoin }
}

interface PerpsPnL {
  // These are coins / amounts
  realized: PerpsPnLCoins
  unrealized: {
    // These are VALUES (usd).
    fees: BigNumber
    funding: BigNumber
    net: BigNumber
    price: BigNumber
  }
}

interface PerpsPnLCoins {
  fees: BNCoin
  funding: BNCoin
  net: BNCoin
  price: BNCoin
}
