interface Account extends AccountChange {
  id: string
  deposits: BNCoin[]
  debts: BNCoin[]
  lends: BNCoin[]
  vaults: DepositedVault[]
}

interface AccountChange {
  deposits?: BNCoin[]
  debts?: BNCoin[]
  lends?: BNCoin[]
  vaults?: DepositedVault[]
}

interface AccountBalanceRow {
  type: string
  symbol: string
  denom: string
  amount: string
  value: string | number
  size: number
  apy: number
}
