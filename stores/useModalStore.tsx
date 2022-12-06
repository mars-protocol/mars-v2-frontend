import create from 'zustand'
import { persist } from 'zustand/middleware'

interface AccountDetailsStore {
  fundAccountModal: boolean
  withdrawModal: boolean
  actions: {
    setFundAccountModal: (show: boolean) => void
    setWithdrawModal: (show: boolean) => void
  }
}

const useModalStore = create<AccountDetailsStore>()(
  persist((set) => ({
    fundAccountModal: false,
    withdrawModal: false,
    actions: {
      setFundAccountModal: (show) => set(() => ({ fundAccountModal: show })),
      setWithdrawModal: (show) => set(() => ({ withdrawModal: show })),
    },
  })),
)

export default useModalStore
