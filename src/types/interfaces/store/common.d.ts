interface CommonSlice {
  accounts: Account[] | null
  address?: string
  balances: Coin[]
  client?: import('@marsprotocol/wallet-connector').WalletClient
  enableAnimations: boolean
  isOpen: boolean
  selectedAccount: string | null
  slippage: number
  status: import('@marsprotocol/wallet-connector').WalletConnectionStatus
}
