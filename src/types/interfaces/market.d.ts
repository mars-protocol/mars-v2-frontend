interface Market {
  denom: string
  borrowRate: number
  debtTotalScaled: string
  collateralTotalScaled: string
  depositEnabled: boolean
  borrowEnabled: boolean
  depositCap: string
}
