interface CommonSlice {
  accounts: Account[] | null
  address?: string
  enableAnimations: boolean
  isOpen: boolean
  balances: Coin[]
  selectedAccount: string | null
  client?: import('@marsprotocol/wallet-connector').WalletClient
  status: import('@marsprotocol/wallet-connector').WalletConnectionStatus
}
