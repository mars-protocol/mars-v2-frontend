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
  pnl: BNCoin
  entryPrice: BigNumber
  update?: boolean
}

interface PerpPositionRow extends PerpsPosition {
  asset: Asset
  liquidationPrice: BigNumber
  leverage: number
}
