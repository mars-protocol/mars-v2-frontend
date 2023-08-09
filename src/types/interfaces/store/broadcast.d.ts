const BNCoin = import('types/classes/BNCoin').BNCoin

interface BroadcastResult {
  result?: import('@delphi-labs/shuttle-react').TxBroadcastResult
  error?: string
}

interface ExecutableTx {
  execute: () => Promise<boolean>
  estimateFee: () => Promise<StdFee>
}

interface BroadcastSlice {
  toast: { message: string; isError?: boolean; title?: string } | null
  executeMsg: (options: { messages: MsgExecuteContract[] }) => Promise<BroadcastResult>
  borrow: (options: { accountId: string; coin: Coin; borrowToWallet: boolean }) => Promise<boolean>
  createAccount: () => Promise<string | null>
  deleteAccount: (options: { accountId: string; lends: BNCoin[] }) => Promise<boolean>
  deposit: (options: { accountId: string; coins: BNCoin[] }) => Promise<boolean>
  unlock: (options: {
    accountId: string
    vault: DepositedVault
    amount: string
  }) => Promise<boolean>
  withdrawFromVaults: (options: { accountId: string; vaults: DepositedVault[] }) => Promise<boolean>
  depositIntoVault: (options: { accountId: string; actions: Action[] }) => Promise<boolean>
  withdraw: (options: { accountId: string; coins: BNCoin[]; borrow: BNCoin[] }) => Promise<boolean>
  lend: (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => Promise<boolean>
  reclaim: (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => Promise<boolean>
  repay: (options: {
    accountId: string
    coin: BNCoin
    accountBalance?: boolean
  }) => Promise<boolean>
  swap: (options: {
    accountId: string
    coinIn: BNCoin
    borrow: BNCoin
    denomOut: string
    slippage: number
  }) => ExecutableTx
}
