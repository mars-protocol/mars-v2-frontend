const BNCoin = import('types/classes/BNCoin').BNCoin
const ActionCoin = import('types/generated').ActionCoin

interface BroadcastResult {
  result?: import('@delphi-labs/shuttle-react').BroadcastResult
  error?: string
}

interface ExecutableTx {
  execute: () => Promise<boolean>
  estimateFee: () => Promise<StdFee>
}

type ToastResponse = {
  hash?: string
  title?: string
} & (ToastSuccess | ToastError)

interface ToastSuccess {
  accountId?: string
  content: { coins: Coin[]; text: string }[]
  isError: false
  message?: string
  timestamp: number
  address: string
  hash: string
}

interface ToastError {
  message: string
  isError: true
}

interface ToastStore {
  recent: ToastSuccess[]
}

interface HandleResponseProps {
  response: BroadcastResult
  action:
    | 'deposit'
    | 'withdraw'
    | 'borrow'
    | 'repay'
    | 'vault'
    | 'vaultCreate'
    | 'lend'
    | 'create'
    | 'delete'
    | 'claim'
    | 'unlock'
    | 'swap'
  lend?: boolean
  accountId?: string
  changes?: { debts?: BNCoin[]; deposits?: BNCoin[]; lends?: BNCoin[] }
  target?: 'wallet' | 'account'
  message?: string
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
  depositIntoVault: (options: {
    accountId: string
    actions: Action[]
    deposits: BNCoin[]
    borrowings: BNCoin[]
    isCreate: boolean
  }) => Promise<boolean>
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
  toast: ToastResponse | null
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
  showTxLoader: boolean
}
