const BNCoin = import('types/classes/BNCoin').BNCoin

interface BroadcastResult {
  result?: import('@delphi-labs/shuttle-react').TxBroadcastResult
  error?: string
}

interface BroadcastSlice {
  toast: { message: string; isError?: boolean; title?: string } | null
  executeMsg: (options: { messages: MsgExecuteContract[]; fee: StdFee }) => Promise<BroadcastResult>
  borrow: (options: {
    fee: StdFee
    accountId: string
    coin: Coin
    borrowToWallet: boolean
  }) => Promise<boolean>
  createAccount: (options: { fee: StdFee }) => Promise<string | null>
  deleteAccount: (options: { fee: StdFee; accountId: string; lends: BNCoin[] }) => Promise<boolean>
  deposit: (options: { fee: StdFee; accountId: string; coins: BNCoin[] }) => Promise<boolean>
  unlock: (options: {
    fee: StdFee
    accountId: string
    vault: DepositedVault
    amount: string
  }) => Promise<boolean>
  withdrawFromVaults: (options: {
    fee: StdFee
    accountId: string
    vaults: DepositedVault[]
  }) => Promise<boolean>
  depositIntoVault: (options: {
    fee: StdFee
    accountId: string
    actions: Action[]
  }) => Promise<boolean>
  withdraw: (options: {
    fee: StdFee
    accountId: string
    coins: BNCoin[]
    borrow: BNCoin[]
  }) => Promise<boolean>
  lend: (options: {
    fee: StdFee
    accountId: string
    coin: BNCoin
    isMax?: boolean
  }) => Promise<boolean>
  reclaim: (options: {
    fee: StdFee
    accountId: string
    coin: BNCoin
    isMax?: boolean
  }) => Promise<boolean>
  repay: (options: {
    fee: StdFee
    accountId: string
    coin: BNCoin
    accountBalance?: boolean
  }) => Promise<boolean>
  swap: (options: {
    fee: StdFee
    accountId: string
    coinIn: BNCoin
    borrow: BNCoin
    denomOut: string
    slippage: number
  }) => Promise<boolean>
}
