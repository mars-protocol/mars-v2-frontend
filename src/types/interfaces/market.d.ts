interface Market {
  denom: string
  borrowRate: number
  debtTotalScaled: number
  collateralTotalScaled: number
  depositEnabled: boolean
  borrowEnabled: boolean
  depositCap: number
}
