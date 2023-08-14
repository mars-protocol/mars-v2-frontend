interface CommonSlice {
  accounts: Account[] | null
  address?: string
  balances: Coin[]
  client?: WalletClient
  isOpen: boolean
  selectedAccount: string | null
  updatedAccount?: Account
  focusComponent: FocusComponent | null
}

interface FocusComponent {
  component: ReactNode
  onClose?: () => void
}
