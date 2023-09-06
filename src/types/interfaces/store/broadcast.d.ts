const BNCoin = import('types/classes/BNCoin').BNCoin
const ActionCoin = import('types/generated').ActionCoin

interface BroadcastResult {
  result?: import('@delphi-labs/shuttle-react').TxBroadcastResult
  error?: string
}

interface ExecutableTx {
  execute: () => Promise<boolean>
  estimateFee: () => Promise<StdFee>
}

interface BroadcastSlice {
  borrow: (options: {
    accountId: string
    coin: BNCoin
    borrowToWallet: boolean
  }) => Promise<boolean>
  claimRewards: (options: { accountId: string }) => ExecutableTx
  createAccount: () => Promise<string | null>
  deleteAccount: (options: { accountId: string; lends: BNCoin[] }) => Promise<boolean>
  deposit: (options: { accountId: string; coins: BNCoin[]; lend: boolean }) => Promise<boolean>
  depositIntoVault: (options: { accountId: string; actions: Action[] }) => Promise<boolean>
  executeMsg: (options: { messages: MsgExecuteContract[] }) => Promise<BroadcastResult>
  lend: (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => Promise<boolean>
  reclaim: (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => Promise<boolean>
  repay: (options: {
    accountId: string
    coin: BNCoin
    accountBalance?: boolean
    lend?: BNCoin
  }) => Promise<boolean>
  swap: (options: {
    accountId: string
    coinIn: BNCoin
    reclaim?: BNCoin
    borrow?: BNCoin
    denomOut: string
    slippage: number
    isMax?: boolean
  }) => ExecutableTx
  toast: { message: string; isError?: boolean; title?: string; hash?: string } | null
  unlock: (options: {
    accountId: string
    vault: DepositedVault
    amount: string
  }) => Promise<boolean>
  withdrawFromVaults: (options: { accountId: string; vaults: DepositedVault[] }) => Promise<boolean>
  withdraw: (options: {
    accountId: string
    coins: Array<{ coin: BNCoin; isMax?: boolean }>
    borrow: BNCoin[]
    reclaims: ActionCoin[]
  }) => Promise<boolean>
}
