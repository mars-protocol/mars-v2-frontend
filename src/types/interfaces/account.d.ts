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
  amount: BigNumber
  apy: number
  denom: string
  size: number
  symbol: string
  type: 'deposits' | 'borrowing' | 'lending' | 'vault'
  value: string
  amountChange: BigNumber
}