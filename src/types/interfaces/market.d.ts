interface Market {
  denom: string
  borrowRate: number
  debtTotalScaled: string
  collateralTotalScaled: string
  depositEnabled: boolean
  borrowEnabled: boolean
  cap: DepositCap
  maxLtv: number
  liquidityRate: number
  liquidationThreshold: number
}
