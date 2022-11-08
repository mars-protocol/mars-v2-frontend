import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import create from 'zustand'
import { persist } from 'zustand/middleware'

import { contractAddresses } from 'config/contracts'
import { Wallet } from 'types'
import { AccountNftClient } from 'types/generated/account-nft/AccountNft.client'
import { CreditManagerClient } from 'types/generated/credit-manager/CreditManager.client'
import { chain } from 'utils/chains'

interface WalletStore {
  address: string
  metamaskInstalled: boolean
  wallet: Wallet | null
  client?: CosmWasmClient
  signingClient?: SigningCosmWasmClient
  clients: {
    accountNft: AccountNftClient | null
    creditManager: CreditManagerClient | null
  }
  actions: {
    disconnect: () => void
    initClients: (address: string, signingClient: SigningCosmWasmClient) => void
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
      clients: {
        accountNft: null,
        creditManager: null,
      },
      actions: {
        disconnect: () => {
          set(() => ({ address: '', wallet: null, signingClient: undefined }))
        },
        initClients: (address, signingClient) => {
          const accountNft = new AccountNftClient(
            signingClient,
            address,
            contractAddresses.accountNft,
          )
          const creditManager = new CreditManagerClient(
            signingClient,
            address,
            contractAddresses.creditManager,
          )

          set(() => ({
            clients: {
              accountNft,
              creditManager,
            },
          }))
        },
        initialize: async () => {
          const clientInstance = await CosmWasmClient.connect(chain.rpc)

          if (get().wallet === Wallet.Keplr && window.keplr) {
            const key = await window.keplr.getKey(chain.chainId)
            const offlineSigner = window.keplr.getOfflineSigner(chain.chainId)

            const address = key.bech32Address
            const signingClientInstance = await SigningCosmWasmClient.connectWithSigner(
              chain.rpc,
              offlineSigner,
            )

            get().actions.initClients(address, signingClientInstance)

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
          const signingClientInstance = await SigningCosmWasmClient.connectWithSigner(
            chain.rpc,
            offlineSigner,
          )

          get().actions.initClients(address, signingClientInstance)

          set(() => ({ address, wallet, signingClient: signingClientInstance }))
        },
        setMetamaskInstalledStatus: (value: boolean) => set(() => ({ metamaskInstalled: value })),
      },
    }),
    {
      name: 'wallet',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['client', 'metamaskInstalled', 'actions', 'address'].includes(key),
          ),
        ),
    },
  ),
)

export default useWalletStore
