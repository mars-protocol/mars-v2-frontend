import create from 'zustand'
import { persist } from 'zustand/middleware'

import { Wallet } from 'types'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { chain } from 'utils/chains'

interface WalletStore {
  address: string
  metamaskInstalled: boolean
  wallet: Wallet | null
  client?: CosmWasmClient
  actions: {
    disconnect: () => void
    initialize: () => void
    connect: (address: string, wallet: Wallet) => void
    setMetamaskInstalledStatus: (value: boolean) => void
  }
}

const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      address: '',
      metamaskInstalled: false,
      wallet: null,
      actions: {
        disconnect: () => {
          set(() => ({ address: '', wallet: null }))
        },
        initialize: async () => {
          const clientInstance = await CosmWasmClient.connect(chain.rpc)
          let address = ''

          if (get().wallet === Wallet.Keplr && window.keplr) {
            const key = await window.keplr.getKey(chain.chainId)
            address = key.bech32Address
          }

          set(() => ({ client: clientInstance, address }))
        },
        connect: (address: string, wallet: Wallet) => set(() => ({ address, wallet })),
        setMetamaskInstalledStatus: (value: boolean) => set(() => ({ metamaskInstalled: value })),
      },
    }),
    {
      name: 'wallet',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['client', 'metamaskInstalled', 'actions', 'address'].includes(key)
          )
        ),
    }
  )
)

export default useWalletStore
