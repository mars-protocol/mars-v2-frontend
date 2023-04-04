interface UseBroadcast {
  msg: Record<string, unknown>
  funds?: Coin[]
  contract: string
  fee: StdFee
  sender?: string
}
