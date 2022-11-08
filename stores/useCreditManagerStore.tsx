import create from 'zustand'
import { persist } from 'zustand/middleware'

interface CreditManagerStore {
  isOpen: boolean
  selectedAccount: string | null
  actions: {
    toggleCreditManager: () => void
    setSelectedAccount: (id: string) => void
  }
}

const useCreditManagerStore = create<CreditManagerStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      selectedAccount: null,
      actions: {
        toggleCreditManager: () => set(() => ({ isOpen: !get().isOpen })),
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

export default useCreditManagerStore
