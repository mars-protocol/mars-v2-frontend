interface Account extends AccountChange {
  id: string
  deposits: BNCoin[]
  debts: BNCoin[]
  lends: BNCoin[]
  vaults: import('types/generated/mars-mock-credit-manager/MarsMockCreditManager.types').ArrayOfVaultInfoResponse
}

interface AccountChange {
  deposits?: BNCoin[]
  debts?: BNCoin[]
  lends?: BNCoin[]
  vaults?: import('types/generated/mars-mock-credit-manager/MarsMockCreditManager.types').ArrayOfVaultInfoResponse
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
