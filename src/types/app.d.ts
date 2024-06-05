interface ICNSReadOnlyInterface {
  contractAddress: string
  primaryName: ({ address }: { address: string }) => Promise<ICNSResult>
}

type Coin = {
  denom: string
  amount: string
}

type StdFee = {
  readonly amount: readonly Coin[]
  readonly gas: string
  /** The granter address that is used for paying with feegrants */
  readonly granter?: string
  /** The fee payer address. The payer must have signed the transaction. */
  readonly payer?: string
}

type ActionCoin = import('types/generated/mars-credit-manager/MarsCreditManager.types').ActionCoin

type BNCoin = import('types/classes/BNCoin').BNCoin

type PositionType = 'deposit' | 'borrow' | 'lend' | 'vault' | 'perp'
type TableType = 'balances' | 'strategies' | 'perps'
type AccountKind = import('types/generated/mars-credit-manager/MarsCreditManager.types').AccountKind

interface Account {
  id: string
  deposits: BNCoin[]
  debts: BNCoin[]
  lends: BNCoin[]
  vaults: DepositedVault[]
  perps: PerpsPosition[]
  perpsVault: PerpsVaultPositions | null
  kind: AccountKind
}

interface AccountChange extends Account {
  deposits?: BNCoin[]
  debts?: BNCoin[]
  lends?: BNCoin[]
  vaults?: DepositedVault[]
  perps?: PerpsPosition[]
  perpsVault?: PerpsVaultPositions
}

interface AccountBalanceRow {
  amount: BigNumber
  apy?: number | null
  denom: string
  size: number
  symbol: string
  type: PositionType
  value: string
  amountChange: BigNumber
}

interface AccountStrategyRow {
  apy?: number | null
  name: string
  denom: string
  value: string
  coins: {
    primary: BNCoin
    secondary?: BNCoin
  }
  coinsChange: {
    primary: BNCoin
    secondary?: BNCoin
  }
  unlocksAt?: number
}

interface AccountPerpRow extends PerpsPosition {
  amount: BigNumber
  symbol: string
  value: string
  amountChange: BigNumber
}

interface AccountIdAndKind {
  id: string
  kind: AccountKind
}

interface HLSAccountWithStrategy extends Account {
  leverage: number
  strategy: HLSStrategy
  values: {
    net: BigNumber
    debt: BigNumber
    total: BigNumber
  }
}

interface PerpsVaultPositions {
  active: {
    amount: BigNumber
    shares: BigNumber
  } | null
  denom: string
  unlocked: BigNumber | null
  unlocking: PerpsVaultUnlockingPosition[]
}

interface PerpsVaultUnlockingPosition {
  amount: BigNumber
  unlocksAt: number
}

interface Asset extends AssetMetaData {
  denom: string
  name: string
  decimals: number
  symbol: string
}

interface AssetMetaData {
  isWhitelisted?: boolean
  isAutoLendEnabled?: boolean
  isBorrowEnabled?: boolean
  isDepositEnabled?: boolean
  isDisplayCurrency?: boolean
  isTradeEnabled?: boolean
  isStable?: boolean
  isStaking?: boolean
  isPerpsEnabled?: boolean
  logo?: string | null
  prefix?: string
  pythPriceFeedId?: string
  pythFeedName?: string
  price?: BNCoin
}

interface AssetPair {
  buy: Asset
  sell: Asset
}

interface PseudoAsset {
  decimals: number
  symbol: string
}

interface BorrowAsset extends Asset {
  borrowRate: number | null
  liquidity: {
    amount: BigNumber
    value: BigNumber
  } | null
}

interface BigNumberCoin {
  denom: string
  amount: BigNumber
}

interface HLSStrategy extends HLSStrategyNoCap {
  depositCap: DepositCap
}

interface HLSStrategyNoCap {
  maxLTV: number
  maxLeverage: number
  apy: number | null
  denoms: {
    deposit: string
    borrow: string
  }
}

interface DepositedHLSStrategy extends HLSStrategy {
  depositedAmount: BigNumber
}

interface StakingApr {
  chainId: string
  currentYield: number
  denom: string
  fees: number
  name: string
  strideYield: number
  unbondingDelay: number
  unbondingPeriod: number
}

interface PerpsMarket {
  asset: Asset
  fundingRate: BigNumber
  openInterest: {
    long: BigNumber
    short: BigNumber
  }
}

interface Bridge {
  name: string
  url: string
  image: string
}

interface ChainConfig {
  lp?: Asset[]
  stables: string[]
  defaultTradingPair: TradingPair
  bech32Config: import('@keplr-wallet/types').Bech32Config
  contracts: {
    redBank: string
    incentives: string
    oracle: string
    swapper: string
    params: string
    creditManager: string
    accountNft: string
    perps: string
    pyth: string
  }
  defaultCurrency: {
    coinDenom: string
    coinMinimalDenom: string
    coinDecimals: number
    coinGeckoId: string
    gasPriceStep: {
      low: number
      average: number
      high: number
    }
  }
  endpoints: {
    rest: string
    rpc: string
    swap: string
    explorer: string
    pools: string
    routes: string
    dexAssets: string
    aprs: {
      vaults: string
      stride: string
    }
  }
  explorerName: string
  features: ('ibc-transfer' | 'ibc-go')[]
  gasPrice: string
  id: import('types/enums').ChainInfoID
  name: string
  network: 'mainnet' | 'testnet'
  vaults: VaultMetaData[]
  hls: boolean
  perps: boolean
  farm: boolean
  anyAsset: boolean
}

interface ContractClients {
  accountNft: import('types/generated/mars-account-nft/MarsAccountNft.client').MarsAccountNftQueryClient
  creditManager: import('types/generated/mars-credit-manager/MarsCreditManager.client').MarsCreditManagerQueryClient
  incentives: import('types/generated/mars-incentives/MarsIncentives.client').MarsIncentivesQueryClient
  oracle: import('types/generated/mars-oracle-osmosis/MarsOracleOsmosis.client').MarsOracleOsmosisQueryClient
  params: import('types/generated/mars-params/MarsParams.client').MarsParamsQueryClient
  perps: import('types/generated/mars-perps/MarsPerps.client').MarsPerpsQueryClient
  redBank: import('types/generated/mars-red-bank/MarsRedBank.client').MarsRedBankQueryClient
  swapper: import('types/generated/mars-swapper-osmosis/MarsSwapperOsmosis.client').MarsSwapperOsmosisQueryClient
  icns: import('types/classes/ICNSClient.client').ICNSQueryClient
}

interface Market {
  asset: Asset
  cap?: DepositCap // Deposits via CM
  debt: BigNumber // Total outstanding debt
  deposits: BigNumber // Deposits directly into the RB
  liquidity: BigNumber // Available liqudiity to be borrowed
  depositEnabled: boolean
  borrowEnabled: boolean
  apy: {
    borrow: number
    deposit: number
  }
  ltv: {
    max: number
    liq: number
  }
}

interface BorrowMarketTableData extends Market {
  accountDebtAmount?: BigNumber
  accountDebtValue?: BigNumber
}

interface LendingMarketTableData extends Market {
  accountLentAmount?: BigNumber
  accountLentValue?: BigNumber
}

type TradeDirection = 'long' | 'short'

interface PerpsPosition {
  denom: string
  baseDenom: string
  tradeDirection: TradeDirection
  amount: BigNumber
  pnl: PerpsPnL
  currentPrice: BigNumber
  entryPrice: BigNumber
  closingFeeRate: BigNumber
}

interface PerpPositionRow extends PerpsPosition {
  asset: Asset
  liquidationPrice: BigNumber
  leverage: number
}

interface PerpsPnL {
  net: BNCoin
  realized: PerpsPnLCoins
  unrealized: PerpsPnLCoins
}

interface PerpsPnLCoins {
  fees: BNCoin
  funding: BNCoin
  net: BNCoin
  price: BNCoin
}

interface PerpsPnL {
  net: BNCoin
  realized: PerpsPnLCoins
  unrealized: PerpsPnLCoins
}

interface PerpsPnLCoins {
  fees: BNCoin
  funding: BNCoin
  net: BNCoin
  price: BNCoin
}

type PerpsTransactionType = 'open' | 'close' | 'modify'

interface PythPriceData {
  price: PythConfidenceData
  ema_price: PythConfidenceData
  id: string
}

interface PythConfidenceData {
  conf: string
  expo: number
  price: string
  publish_time: number
}

interface PythUpdateExecuteMsg {
  update_price_feeds: { data: string[] }
}

type Page =
  | 'trade'
  | 'trade-advanced'
  | 'perps'
  | 'borrow'
  | 'farm'
  | 'lend'
  | 'portfolio'
  | 'portfolio/{accountId}'
  | 'hls-farm'
  | 'hls-staking'
  | 'governance'
  | 'execute'
  | 'v1'

type OsmosisRouteResponse = {
  amount_in: {
    denom: string
    amount: string
  }
  amount_out: string
  route: OsmosisRoute[]
  effective_fee: string
  price_impact: string
}

type OsmosisRoute = {
  pools: OsmosisRoutePool[]
  'has-cw-pool': boolean
  out_amount: string
  in_amount: string
}

type OsmosisRoutePool = {
  id: number
  type: number
  balances: []
  spread_factor: string
  token_out_denom: string
  taker_fee: string
}

type SwapRouteInfo = {
  priceImpact: BigNumber
  fee: BigNumber
  route: import('types/generated/mars-credit-manager/MarsCreditManager.types').SwapperRoute
  description: string
}

type AstroportRouteResponse = {
  id: string
  swaps: AstroportRoute[]
  denom_in: string
  decimals_in: number
  price_in: number
  value_in: string
  amount_in: string
  denom_out: string
  decimals_out: number
  price_out: number
  value_out: string
  amount_out: string
  price_difference: number
  price_impact: number
}

type AstroportRoute = {
  contract_addr: string
  from: string
  to: string
  type: string
  illiquid: boolean
}

interface SelectOption {
  value?: string
  label?: string | ReactNode
  denom?: string
  amount?: BigNumber
}

interface AstroportSwapRouteResponse {
  amount_in: string
  amount_out: string
  decimals_in: number
  decimals_out: number
  denom_in: string
  denom_out: string
  id: string
  price_difference: number
  price_impact: number
  price_in: number
  price_out: number
  swaps: Swap[]
  value_in: string
  value_out: string
}

interface AstroportSwapResponse {
  contract_addr: string
  from: string
  illiquid: boolean
  to: string
  type: SwapPoolType
}

type TooltipType = 'info' | 'warning' | 'error'

interface V1Positions {
  deposits: BNCoin[]
  debts: BNCoin[]
}

type BigNumber = import('bignumber.js').BigNumber

interface VaultMetaData {
  address: string
  name: string
  lockup: Lockup
  provider: string
  denoms: {
    primary: string
    secondary: string
    lp: string
    vault: string
  }
  symbols: {
    primary: string
    secondary: string
  }
  isFeatured?: boolean
  isHls?: boolean
}

interface VaultInfo {
  address: string
  ltv: {
    max: number
    liq: number
  }
  cap: DepositCap | null
}

interface VaultConfig extends VaultMetaData, VaultInfo {}

interface Vault extends VaultConfig {
  hls?: {
    maxLTV: number
    maxLeverage: number
    borrowDenom: string
  }
  apr?: number | null
  apy?: number | null
}

interface PerpsVault {
  apy?: number | null
  collateralizationRatio: number
  denom: string
  name: string
  provider: string
  liquidity: BigNumber
  lockup: Lockup
  cap: DepositCap | null
}

interface VaultValuesAndAmounts {
  amounts: {
    primary: BigNumber
    secondary: BigNumber
    locked: BigNumber
    unlocked: BigNumber
    unlocking: BigNumber
  }
  values: {
    primary: BigNumber
    secondary: BigNumber
    unlocked: BigNumber
    unlocking: BigNumber
  }
}

type VaultStatus = 'active' | 'unlocking' | 'unlocked'

interface DepositedVault extends Vault, VaultValuesAndAmounts {
  type: 'normal' | 'perp'
  status: VaultStatus
  unlockId?: number
  unlocksAt?: number
}

interface VaultExtensionResponse {
  base_token_amount: string
  id: number
  owner: string
  release_at: {
    at_time: string
  }
}

interface VaultPositionFlatAmounts {
  locked: BigNumber
  unlocking: BigNumber
  unlocked: BigNumber
}

interface DepositCap {
  denom: string
  used: BigNumber
  max: BigNumber
}

interface ProvideLiquidityAction {
  provide_liquidity: {
    account_id: string
    coins_in: import('types/generated/mars-credit-manager/MarsCreditManager.types').ActionCoin[]
    lp_token_out: string
    minimum_receive: import('types/generated/mars-credit-manager/MarsCreditManager.types').Uint128
  }
}

interface AprResponse {
  vaults: AprVault[]
}

interface AprVault {
  chain: string
  address: string
  apr: AprBreakdown
}

interface AprBreakdown {
  start_timestamp: number
  end_timestamp: number
  period_diff: number
  start_vault_token_price: number
  end_vault_token_price: number
  period_yield: number
  period_daily_return: number
  projected_apr: number
}

interface Apr {
  address: string
  apr?: number | null
  apy?: number | null
}

interface Lockup {
  duration: number
  timeframe: string
}

type WalletInfos = Record<WalletID, WalletInfo>

interface WalletInfo {
  name: string
  install?: string
  installURL?: string
  imageURL: string
  mobileImageURL?: string
  supportedChains: ChainInfoID[]
  walletConnect?: string
}

type ChainInfos = Record<ChainInfoID, ChainInfo>
type Network = import('@delphi-labs/shuttle-react').Network

interface ChainInfo extends Network {
  explorer: string
  explorerName: string
}

interface ICNSResult {
  names: string[]
  primary_name: string
}

interface WalletClient {
  sign: (options: {
    messages: import('@delphi-labs/shuttle-react').TransactionMsg<any>[]
    feeAmount?: string | null | undefined
    gasLimit?: string | null | undefined
    memo?: string | null | undefined
    wallet?: import('@delphi-labs/shuttle-react').WalletConnection | null | undefined
  }) => Promise<import('@delphi-labs/shuttle-react').SigningResult>
  cosmWasmClient: import('@cosmjs/cosmwasm-stargate').CosmWasmClient
  connectedWallet: import('@delphi-labs/shuttle-react').WalletConnection
  broadcast: (options: {
    messages: import('@delphi-labs/shuttle-react').TransactionMsg<any>[]
    feeAmount?: string | null | undefined
    gasLimit?: string | null | undefined
    memo?: string | null | undefined
    wallet?: import('@delphi-labs/shuttle-react').WalletConnection | null | undefined
  }) => Promise<import('@delphi-labs/shuttle-react').BroadcastResult>
  simulate: (options: {
    messages: import('@delphi-labs/shuttle-react').TransactionMsg<any>[]
    wallet?: import('@delphi-labs/shuttle-react').WalletConnection | null | undefined
  }) => Promise<import('@delphi-labs/shuttle-react').SimulateResult>
}

interface AssetTableRow {
  balance?: string
  asset: BorrowAsset | Asset
  market?: Market
  value?: BigNumber
}

interface PythBarQueryData {
  s: string
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

interface TheGraphBarQueryData {
  close: string
  high: string
  low: string
  open: string
  timestamp: string
  volume: string
}

interface Bar {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface StreamData {
  id: string
  p: number
  t: number
  f: string
  s: number
}

interface Item {
  title: string
  renderContent: () => React.ReactNode
  isOpen?: boolean
  renderSubTitle: () => React.ReactNode
  toggleOpen: (index: number) => void
}

type OverlayState = 'buy' | 'sell' | 'pair' | 'closed'

interface ButtonProps {
  autoFocus?: boolean
  children?: string | ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  disabled?: boolean
  id?: string
  showProgressIndicator?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  text?: string | ReactNode
  variant?: 'solid' | 'transparent' | 'round' | 'rounded'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseOver?: (e: React.MouseEvent<HTMLButtonElement>) => void
  leftIcon?: ReactElement
  rightIcon?: ReactElement
  iconClassName?: string
  hasSubmenu?: boolean
  hasFocus?: boolean
  dataTestId?: string
  tabIndex?: number
  textClassNames?: string
}

type CardTab = {
  title: string
  notificationCount?: number
  renderContent: () => React.ReactNode
}

type DocLinkType = 'wallet' | 'account' | 'terms' | 'fund' | 'hls'

interface DropDownItem {
  icon: import('react').ReactNode
  onClick: () => void
  text: string
  disabled?: boolean
  disabledTooltip?: string
}

interface FormattedNumberProps {
  amount: number | string
  animate?: boolean
  className?: string
  minDecimals?: number
  maxDecimals?: number
  thousandSeparator?: boolean
  prefix?: boolean | string
  suffix?: boolean | string
  rounded?: boolean
  abbreviated?: boolean
}

interface FormatOptions {
  decimals?: number
  minDecimals?: number
  maxDecimals?: number
  thousandSeparator?: boolean
  prefix?: string
  suffix?: string
  rounded?: boolean
  abbreviated?: boolean
}

interface MenuTreeEntry {
  pages: Page[]
  label: string
  externalUrl?: string
  submenu?: MenuTreeSubmenuEntry[]
}

interface MenuTreeSubmenuEntry {
  page: Page
  label: string
  subtitle?: string
  icon?: React.ReactNode
}

interface RiskTimePair {
  date: string
  risk: number
}

interface RiskChartProps {
  data: RiskTimePair[]
}

interface SummaryItem {
  amount: number
  options: FormatOptions
  title: string
  warningMessages?: string[]
}

interface Route {
  pool_id: string
  token_out_denom: string
}

interface Tab {
  page: Page
  name: string
}

interface TradingPair {
  buy: string
  sell: string
}

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
  resyncOracle: () => Promise<boolean>
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

type TransactionCoinType =
  | 'borrow'
  | 'deposit'
  | 'deposit_from_wallet'
  | 'lend'
  | 'reclaim'
  | 'repay'
  | 'swap'
  | 'withdraw'
  | 'farm'
  | 'vault'
  | 'perps'
  | 'perpsPnl'

interface TransactionCoin {
  type: TransactionCoinType
  coin: BNCoin
  before?: BNCoin
}

interface GroupedTransactionCoin {
  type: TransactionCoinType
  coins: { coin: BNCoin; before?: BNCoin }[]
}

type TransactionRecipient = 'contract' | 'wallet'

interface TransactionEvent {
  type: string
  attributes: TransactionEventAttribute[]
}

interface TransactionEventAttribute {
  key: string
  value: string
}

type TransactionType = 'default' | 'oracle' | 'create' | 'burn' | 'unlock' | 'transaction'

interface CommonSlice {
  address?: string
  chainConfig: ChainConfig
  userDomain?: {
    domain: string
    domain_full: string
  }
  balances: Coin[]
  client?: WalletClient
  isOpen: boolean
  selectedAccount: string | null
  updatedAccount?: Account
  focusComponent: FocusComponent | null
  mobileNavExpanded: boolean
  accountDetailsExpanded: boolean
  migrationBanner: boolean
  tutorial: boolean
  useMargin: boolean
  useAutoRepay: boolean
  isOracleStale: boolean
  isHLS: boolean
  isV1: boolean
  assets: Asset[]
}

interface FocusComponent {
  component: import('react').JSX.Element | null
  onClose?: () => void
}

interface ModalSlice {
  accountDeleteModal: Account | null
  addVaultBorrowingsModal: AddVaultBorrowingsModal | null
  alertDialog: AlertDialogConfig | null
  assetOverlayState: OverlayState
  hlsModal: HlsModal | null
  hlsManageModal: HlsManageModal | null
  borrowModal: BorrowModal | null
  fundAndWithdrawModal: 'fund' | 'withdraw' | null
  getStartedModal: boolean
  hlsInformationModal: boolean | null
  lendAndReclaimModal: LendAndReclaimModalConfig | null
  perpsVaultModal: PerpsVaultModal | null
  settingsModal: boolean
  unlockModal: UnlockModal | null
  vaultModal: VaultModal | null
  walletAssetsModal: WalletAssetModal | null
  withdrawFromVaultsModal: DepositedVault[] | null
  v1DepositAndWithdrawModal: V1DepositAndWithdrawModal | null
  v1BorrowAndRepayModal: V1BorrowAndRepayModal | null
}

interface AlertDialogButton {
  text?: string
  icon?: JSX.Element
  isAsync?: boolean
  onClick?: () => Promise<void> | void
}

interface AlertDialogConfig {
  icon?: JSX.Element
  checkbox?: {
    text: string
    onClick: (isChecked: boolean) => void
  }
  content: JSX.Element | string
  negativeButton?: AlertDialogButton
  positiveButton?: AlertDialogButton
  title: string
}

interface BorrowModal {
  asset: Asset
  marketData: BorrowMarketTableData
  isRepay?: boolean
}

type LendAndReclaimModalAction = 'lend' | 'reclaim'

interface LendAndReclaimModalConfig {
  data: LendingMarketTableData
  action: LendAndReclaimModalAction
}

interface VaultModal {
  vault: Vault | DepositedVault
  isDeposited?: boolean
  selectedBorrowDenoms: string[]
  isCreate: boolean
}

interface AddVaultBorrowingsModal {
  selectedDenoms: string[]
}

interface UnlockModal {
  vault: DepositedVault
}

interface WalletAssetModal {
  isOpen?: boolean
  selectedDenoms: string[]
  isBorrow?: boolean
}

interface HlsModal {
  strategy?: HLSStrategy
  vault?: Vault
}

interface HlsManageModal {
  accountId: string
  staking: {
    strategy: HLSStrategy
    action: HlsStakingManageAction
  }
}

type HlsStakingManageAction = 'deposit' | 'withdraw' | 'repay' | 'leverage'

interface PerpsVaultModal {
  type: 'deposit' | 'unlock'
}

interface V1DepositAndWithdrawModal {
  type: 'deposit' | 'withdraw'
  data: LendingMarketTableData
}

interface V1BorrowAndRepayModal {
  type: 'borrow' | 'repay'
  data: BorrowMarketTableData
}

interface Settings {
  accountSummaryInModalTabsExpanded: boolean[]
  accountSummaryTabsExpanded: boolean[]
  displayCurrency: string
  reduceMotion: boolean
  tradingPairSimple: TradingPair
  tradingPairAdvanced: TradingPair
  perpsAsset: string
  enableAutoLendGlobal: boolean
  slippage: number
  tutorial: boolean
  migrationBanner: boolean
  updateOracle: boolean
  chartInterval: import('utils/charting_library').ResolutionString
  theme: string
}

interface KeyValuePair {
  [key: string]: number
}

interface ModalProps {
  header: string | ReactNode
  subHeader?: string | ReactNode
  headerClassName?: string
  hideCloseBtn?: boolean
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  contentClassName?: string
  modalClassName?: string
  onClose: () => void
  hideTxLoader?: boolean
  dialogId?: string
}

interface VaultBorrowingsProps {
  account: Account
  borrowings: BNCoin[]
  deposits: BNCoin[]
  primaryAsset: Asset
  secondaryAsset: Asset
  vault: Vault
  depositActions: Action[]
  onChangeBorrowings: (borrowings: BNCoin[]) => void
  displayCurrency: string
  depositCapReachedCoins: BNCoin[]
}

type AvailableOrderType = 'Market' | 'Limit' | 'Stop'
interface OrderTab {
  type: AvailableOrderType
  isDisabled: boolean
  tooltipText: string
}

interface VaultValue {
  address: string
  value: BigNumber
}

interface PerpsParams {
  denom: string
  closingFeeRate: BigNumber
  maxOpenInterestLong: BigNumber
  maxOpenInterestShort: BigNumber
  maxPositionValue: BigNumber | null
  minPositionValue: BigNumber
  openingFeeRate: BigNumber
}

interface Store extends CommonSlice, BroadcastSlice, ModalSlice {}

interface FormatOptions {
  decimals?: number
  minDecimals?: number
  maxDecimals?: number
  thousandSeparator?: boolean
  prefix?: string
  suffix?: string
  rounded?: boolean
  abbreviated?: boolean
}

interface TradingViewSettings {
  theme: import('utils/charting_library/charting_library').ThemeName
  backgroundColor: string
  stylesheet: string
  overrides: {
    'paneProperties.background': string
    'linetooltrendline.linecolor': string
  }
  loadingScreen: {
    backgroundColor: string
    foregroundColor: string
  }
  chartStyle: {
    upColor: string
    downColor: string
    borderColor: string
    borderUpColor: string
    borderDownColor: string
    wickUpColor: string
    wickDownColor: string
  }
}

type PnL =
  | 'break_even'
  | {
      profit: Coin
    }
  | {
      loss: Coin
    }

interface AstroportAsset {
  chainId: string
  denom: string
  symbol: string
  icon?: string
  description: string
  decimals: number
  priceUSD: number
  totalLiquidityUSD: number
  dayVolumeUSD: number
}

interface Pool {
  '@type': string
  address: string
  future_pool_governor: string
  id: string
  pool_assets?: PoolAsset[]
  pool_liquidity?: PoolLiquidity[]
  pool_params: PoolParams
  total_shares: TotalShares
  total_weight: string
}

interface PoolAsset {
  token: TotalShares
  weight: string
}

interface PoolLiquidity {
  amount: string
  denom: string
}
interface TotalShares {
  amount: string
  denom: string
}

interface PoolParams {
  exit_fee: string
  smooth_weight_change_params: null
  swap_fee: string
}
