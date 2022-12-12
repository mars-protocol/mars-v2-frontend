import create from 'zustand'

interface AccountDetailsStore {
  isOpen: boolean
  selectedAccount: string | null
}

export const useAccountDetailsStore = create<AccountDetailsStore>()(() => ({
  isOpen: true,
  selectedAccount: null,
}))
