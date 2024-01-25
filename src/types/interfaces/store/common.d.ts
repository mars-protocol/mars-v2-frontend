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
  accountDetailsExpanded: boolean
  migrationBanner: boolean
  tutorial: boolean
  useMargin: boolean
  useAutoRepay: boolean
  isOracleStale: boolean
  isHLS: boolean
}

interface FocusComponent {
  component: import('react').JSX.Element | null
  onClose?: () => void
}
