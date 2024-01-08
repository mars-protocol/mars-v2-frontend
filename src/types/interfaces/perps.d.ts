const BNCoin = import('types/classes/BNCoin').BNCoin

type OrderDirection = PerpsType | ('buy' | 'sell')

type PerpsType = 'long' | 'short'

// TODO: 📈Remove this type when healthcomputer is implemented
type PositionsWithoutPerps = Omit<
  import('types/generated/mars-credit-manager/MarsCreditManager.types').Positions,
  'perps'
>

type PerpsPosition = {
  denom: string
  baseDenom: string
  type: PerpsType
  size: BigNumber
  // closingFee: BNCoin
}
