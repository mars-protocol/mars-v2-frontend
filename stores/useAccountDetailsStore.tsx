import create from 'zustand'

interface AccountDetailsStore {
  isOpen: boolean
  selectedAccount: string | null
}

export const useAccountDetailsStore = create<AccountDetailsStore>()((set) => ({
  isOpen: true,
  selectedAccount: null,
}))
