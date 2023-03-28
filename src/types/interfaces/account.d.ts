interface AccountDetails {
  id: string
  deposits?: import('@cosmjs/stargate').Coin[]
  debts?: import('@cosmjs/stargate').Coin[]
}
