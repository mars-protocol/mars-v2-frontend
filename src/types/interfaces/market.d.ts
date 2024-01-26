interface Market {
  asset: Asset
  cap: DepositCap // Deposits via CM
  debt: BigNumber // Total outstanding debt
  deposits: BigNumber // Deposits directly into the RB
  liquidity: BigNumber // Available liqudiity to be borrowed
  depositEnabled: boolean
  borrowEnabled: boolean
  apy: {
    borrow: number
    deposit: number
  }
  ltv: {
    max: number
    liq: number
  }
}

interface BorrowMarketTableData extends Market {
  accountDebt?: BigNumber
}

interface LendingMarketTableData extends Market {
  accountLentAmount?: BigNumber
  accountLentValue?: BigNumber
}
