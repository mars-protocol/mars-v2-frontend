interface Market {
  denom: string
  debtTotalScaled: string
  collateralTotalScaled: string
  depositEnabled: boolean
  borrowEnabled: boolean
  cap: DepositCap
  apy: {
    borrow: number
    deposit: number
  }
  ltv: {
    max: number
    liq: number
  }
}
