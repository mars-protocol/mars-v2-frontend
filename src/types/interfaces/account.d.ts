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
