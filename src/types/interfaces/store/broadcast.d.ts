interface BroadcastResult {
  result?: import('@marsprotocol/wallet-connector').TxBroadcastResult
  error?: string
}

interface BroadcastSlice {
  toast: { message: string; isError?: boolean } | null
  executeMsg: (options: {
    msg: Record<string, unknown>
    fee: StdFee
    funds?: Coin[]
  }) => Promise<BroadcastResult>
  borrow: (options: { fee: StdFee; accountId: string; coin: Coin }) => Promise<void>
  createAccount: (options: { fee: StdFee }) => Promise<string | null>
  deleteAccount: (options: { fee: StdFee; accountId: string }) => Promise<boolean>
  deposit: (options: { fee: StdFee; accountId: string; coin: Coin }) => Promise<boolean>
  withdraw: (options: { fee: StdFee; accountId: string; coin: Coin }) => Promise<boolean>
  repay: (options: {
    fee: StdFee
    accountId: string
    coin: Coin
    accountBalance?: boolean
  }) => Promise<boolean>
}
