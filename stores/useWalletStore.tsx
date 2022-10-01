import create from 'zustand'
import { persist } from 'zustand/middleware'

import { Wallet } from 'types'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { chain } from 'utils/chains'

interface WalletStore {
  address: string
  injectiveAddress: string
  addresses: string[]
  metamaskInstalled: boolean
  wallet: Wallet
  client?: CosmWasmClient
  actions: {
    initialize: () => void
    setAddress: (address: string) => void
    setMetamaskInstalledStatus: (value: boolean) => void
  }
}

const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      address: '',
      injectiveAddress: '',
      addresses: [],
      metamaskInstalled: false,
      wallet: Wallet.Metamask,
      actions: {
        initialize: async () => {
          const clientInstance = await CosmWasmClient.connect(chain.rpc)
          set(() => ({ client: clientInstance }))
        },
        setAddress: (address: string) => set(() => ({ address })),
        setMetamaskInstalledStatus: (value: boolean) => set(() => ({ metamaskInstalled: value })),
      },
    }),
    {
      name: 'wallet',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['client', 'metamaskInstalled', 'actions'].includes(key)
          )
        ),
    }
  )
)

export default useWalletStore
