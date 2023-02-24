interface UseBroadcast {
  msg: Record<string, unknown>
  funds?: import('@cosmjs/stargate').Coin[]
  contract: string
  fee: import('@cosmjs/stargate').StdFee
  sender?: string
}
