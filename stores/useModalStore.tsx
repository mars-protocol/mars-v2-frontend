import create from 'zustand'
import { persist } from 'zustand/middleware'

interface AccountDetailsStore {
  fundAccountModal: boolean
  withdrawModal: boolean
  createAccountModal: boolean
  deleteAccountModal: boolean
  actions: {
    setFundAccountModal: (show: boolean) => void
    setWithdrawModal: (show: boolean) => void
    setCreateAccountModal: (show: boolean) => void
    setDeleteAccountModal: (show: boolean) => void
  }
}

export const useModalStore = create<AccountDetailsStore>()(
  persist((set) => ({
    fundAccountModal: false,
    withdrawModal: false,
    createAccountModal: false,
    deleteAccountModal: false,
    actions: {
      setFundAccountModal: (show) => set({ fundAccountModal: show }),
      setWithdrawModal: (show) => set({ withdrawModal: show }),
      setCreateAccountModal: (show) => set({ createAccountModal: show }),
      setDeleteAccountModal: (show) => set({ deleteAccountModal: show }),
    },
  })),
)
