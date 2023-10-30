interface CommonSlice {
  accounts: Account[] | null
  address?: string
  balances: Coin[]
  hlsAccounts: Account[] | null
  client?: WalletClient
  isOpen: boolean
  selectedAccount: string | null
  updatedAccount?: Account
  focusComponent: FocusComponent | null
  accountDetailsExpanded: boolean
  migrationBanner: boolean
  tutorial: boolean
  useMargin: boolean
}

interface FocusComponent {
  component: import('react').JSX.Element | null
  onClose?: () => void
}
