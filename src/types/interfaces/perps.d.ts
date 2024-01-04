type OrderDirection = 'long' | 'short' | 'buy' | 'sell'

// TODO: 📈Remove this type when healthcomputer is implemented
type PositionsWithoutPerps = Omit<
  import('types/generated/mars-credit-manager/MarsCreditManager.types').Positions,
  'perps'
>
