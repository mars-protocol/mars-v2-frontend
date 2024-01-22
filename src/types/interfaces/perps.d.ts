type TradeDirection = 'long' | 'short'

// TODO: 📈Remove this type when healthcomputer is implemented
type PositionsWithoutPerps = Omit<
  import('types/generated/mars-credit-manager/MarsCreditManager.types').Positions,
  'perps'
>

type PerpsPosition = {
  denom: string
  baseDenom: string
  tradeDirection: TradeDirection
  size: BigNumber
  closingFee: BNCoin
  pnl: BNCoin
}
