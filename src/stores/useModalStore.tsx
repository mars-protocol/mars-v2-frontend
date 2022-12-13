import create from 'zustand'

interface AccountDetailsStore {
  fundAccountModal: boolean
  withdrawModal: boolean
  createAccountModal: boolean
  deleteAccountModal: boolean
}

export const useModalStore = create<AccountDetailsStore>()(() => ({
  fundAccountModal: false,
  withdrawModal: false,
  createAccountModal: false,
  deleteAccountModal: false,
}))
