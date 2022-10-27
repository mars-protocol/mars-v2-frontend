import create from 'zustand'
import { persist } from 'zustand/middleware'

import { Wallet } from 'types'
import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { chain } from 'utils/chains'

interface WalletStore {
  address: string
  metamaskInstalled: boolean
  wallet: Wallet | null
  client?: CosmWasmClient
  signingClient?: SigningCosmWasmClient
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
          set(() => ({ address: '', wallet: null, signingClient: undefined }))
        },
        initialize: async () => {
          const clientInstance = await CosmWasmClient.connect(chain.rpc)

          if (get().wallet === Wallet.Keplr && window.keplr) {
            const key = await window.keplr.getKey(chain.chainId)
            const offlineSigner = window.keplr.getOfflineSigner(chain.chainId)

            const address = key.bech32Address
            const signingClientInstance = await SigningCosmWasmClient.connectWithSigner(
              chain.rpc,
              offlineSigner
            )

            set(() => ({
              client: clientInstance,
              signingClient: signingClientInstance,
              address,
            }))
            return
          }

          set(() => ({ client: clientInstance }))
        },
        connect: async (address: string, wallet: Wallet) => {
          if (!window.keplr) return

          const offlineSigner = window.keplr.getOfflineSigner(chain.chainId)
          const clientInstance = await SigningCosmWasmClient.connectWithSigner(
            chain.rpc,
            offlineSigner
          )

          set(() => ({ address, wallet, signingClient: clientInstance }))
        },
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
