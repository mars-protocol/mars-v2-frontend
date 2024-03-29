interface BroadcastResult {
  result?: import('@delphi-labs/shuttle-react').BroadcastResult
  error?: string
}

interface ExecutableTx {
  execute: () => Promise<boolean>
  estimateFee: () => Promise<StdFee>
}

interface ToastObjectOptions extends HandleResponseProps {
  id?: number
}

interface ToastObject {
  response: Promise<BroadcastResult>
  options: ToastObjectOptions
}

interface ToastPending {
  id: number
  promise: Promise<BroadcastResult>
}

type ToastResponse = {
  id: number
  hash?: string
  title?: string
} & (ToastSuccess | ToastError)

interface ToastSuccess {
  target: string
  content: ToastContent[]
  isError: boolean
  message?: string
  hash: string
  address: string
  timestamp: number
}

interface ToastContent {
  coins: Coin[]
  text: string
}

interface ToastError {
  message: string
  isError: true
}

interface ToastStore {
  recent: ToastSuccess[]
}

interface HandleResponseProps {
  id: number
  response?: BroadcastResult
  accountId?: string
  message?: string
}

interface BroadcastSlice {
  addToStakingStrategy: (options: {
    accountId: string
    actions: Action[]
    depositCoin: BNCoin
    borrowCoin: BNCoin
  }) => Promise<boolean>
  borrow: (options: {
    accountId: string
    coin: BNCoin
    borrowToWallet: boolean
  }) => Promise<boolean>
  changeHlsStakingLeverage: (options: { accountId: string; actions: Action[] }) => Promise<boolean>
  claimRewards: (options: { accountId: string }) => ExecutableTx
  closeHlsStakingPosition: (options: { accountId: string; actions: Action[] }) => Promise<boolean>
  createAccount: (
    accountKind: import('types/generated/mars-rover-health-types/MarsRoverHealthTypes.types').AccountKind,
  ) => Promise<string | null>
  deleteAccount: (options: { accountId: string; lends: BNCoin[] }) => Promise<boolean>
  deposit: (options: { accountId: string; coins: BNCoin[]; lend: boolean }) => Promise<boolean>
  depositIntoVault: (options: {
    accountId: string
    actions: Action[]
    deposits: BNCoin[]
    borrowings: BNCoin[]
    isCreate: boolean
    kind: import('types/generated/mars-rover-health-types/MarsRoverHealthTypes.types').AccountKind
  }) => Promise<boolean>
  execute: (contract: string, msg: ExecuteMsg, funds: Coin[]) => Promise<BroadcastResult>
  executeMsg: (options: {
    messages: MsgExecuteContract[]
    isPythUpdate?: boolean
  }) => Promise<BroadcastResult>
  lend: (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => Promise<boolean>
  closePerpPosition: (options: { accountId: string; denom: string }) => Promise<boolean>
  openPerpPosition: (options: { accountId: string; coin: BNCoin }) => Promise<boolean>
  modifyPerpPosition: (options: {
    accountId: string
    coin: BNCoin
    changeDirection: boolean
  }) => Promise<boolean>
  reclaim: (options: { accountId: string; coin: BNCoin; isMax?: boolean }) => Promise<boolean>
  repay: (options: {
    accountId: string
    coin: BNCoin
    accountBalance?: boolean
    lend?: BNCoin
    fromWallet?: boolean
  }) => Promise<boolean>
  handleTransaction: (options: { response: Promise<BroadcastResult>; message?: string }) => void
  swap: (options: {
    accountId: string
    coinIn: BNCoin
    reclaim?: BNCoin
    borrow?: BNCoin
    denomOut: string
    slippage: number
    isMax?: boolean
    repay: boolean
    route: import('types/generated/mars-credit-manager/MarsCreditManager.types').SwapperRoute
  }) => ExecutableTx
  toast: ToastResponse | ToastPending | null
  unlock: (options: {
    accountId: string
    vault: DepositedVault
    amount: string
  }) => Promise<boolean>
  updateOracle: () => Promise<boolean>
  getPythVaas: () => Promise<import('@delphi-labs/shuttle-react').MsgExecuteContract>
  withdrawFromVaults: (options: {
    accountId: string
    vaults: DepositedVault[]
    slippage: number
  }) => Promise<boolean>
  withdraw: (options: {
    accountId: string
    coins: Array<{ coin: BNCoin; isMax?: boolean }>
    borrow: BNCoin[]
    reclaims: ActionCoin[]
  }) => Promise<boolean>
  depositIntoPerpsVault: (options: {
    accountId: string
    denom: string
    fromDeposits?: BigNumber
    fromLends?: BigNumber
  }) => Promise<boolean>
  requestUnlockPerpsVault: (options: { accountId: string; amount: BigNumber }) => Promise<boolean>
  withdrawFromPerpsVault: (options: { accountId: string }) => Promise<boolean>
  v1Action: (type: V1ActionType, funds: BNCoin) => Promise<boolean>
}

type V1ActionType = 'withdraw' | 'deposit' | 'borrow' | 'repay'

interface Event {
  type: string
  attributes: { key: string; value: string }[]
}

interface TransactionCoins {
  borrow: Coin[]
  deposit: Coin[]
  lend: Coin[]
  reclaim: Coin[]
  repay: Coin[]
  swap: Coin[]
  withdraw: Coin[]
}

type TransactionCoinType = keyof TransactionCoins

type TransactionRecipient = 'contract' | 'wallet'

interface TransactionEvent {
  type: string
  attributes: TransactionEventAttribute[]
}

interface TransactionEventAttribute {
  key: string
  value: string
}
