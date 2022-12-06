import create from 'zustand'
import { persist } from 'zustand/middleware'

interface AccountDetailsStore {
  isOpen: boolean
  selectedAccount: string | null
  actions: {
    toggleAccountDetails: () => void
    setSelectedAccount: (id: string) => void
  }
}

const useAccountDetailsStore = create<AccountDetailsStore>()(
  persist(
    (set, get) => ({
      isOpen: true,
      selectedAccount: null,
      actions: {
        toggleAccountDetails: () => set(() => ({ isOpen: !get().isOpen })),
        setSelectedAccount: (accountId: string) => {
          set(() => ({
            selectedAccount: accountId,
          }))
        },
      },
    }),
    {
      name: 'creditManager',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ['selectedAccount'].includes(key)),
        ),
    },
  ),
)

export default useAccountDetailsStore
