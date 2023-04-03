interface Position {
  account: string
  deposits: import('@cosmjs/stargate').Coin[]
  debts: import('@cosmjs/stargate').Coin[]
  lends: import('@cosmjs/stargate').Coin[]
}
