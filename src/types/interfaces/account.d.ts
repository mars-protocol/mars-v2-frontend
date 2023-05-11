interface Account {
  id: string
  deposits: Coin[]
  debts: Coin[]
  lends: Coin[]
  vaults: import('types/generated/mars-mock-credit-manager/MarsMockCreditManager.types').ArrayOfVaultInfoResponse
}

interface AccountChange {
  deposits?: Coin[]
  debts?: Coin[]
  lends?: Coin[]
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
