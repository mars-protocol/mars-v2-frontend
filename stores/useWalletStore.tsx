import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import create from 'zustand'
import {
  WalletChainInfo,
  WalletConnectionStatus,
  WalletSigningCosmWasmClient,
} from '@marsprotocol/wallet-connector'

import { MarsCreditManagerClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { contractAddresses } from 'config/contracts'
import { MarsAccountNftClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsSwapperBaseClient } from 'types/generated/mars-swapper-base/MarsSwapperBase.client'

interface WalletStore {
  address?: string
  chainInfo?: WalletChainInfo
  metamaskInstalled: boolean
  name?: string
  status: WalletConnectionStatus
  signingClient?: WalletSigningCosmWasmClient
  clients: {
    accountNft?: MarsAccountNftClient
    creditManager?: MarsCreditManagerClient
    swapperBase?: MarsSwapperBaseClient
  }
  actions: {
    initClients: (address: string, signingClient: SigningCosmWasmClient) => void
    initialize: (
      status: WalletConnectionStatus,
      signingCosmWasmClient?: WalletSigningCosmWasmClient,
      address?: string,
      name?: string,
      chainInfo?: WalletChainInfo,
    ) => void
    setMetamaskInstalledStatus: (value: boolean) => void
  }
}

export const useWalletStore = create<WalletStore>()((set, get) => ({
  metamaskInstalled: false,
  status: WalletConnectionStatus.ReadyForConnection,
  clients: {},
  actions: {
    initClients: (address, signingClient) => {
      const client = get().signingClient
      if (!client) return
      const accountNft = new MarsAccountNftClient(client, address, contractAddresses.accountNft)
      const creditManager = new MarsCreditManagerClient(
        signingClient,
        address,
        contractAddresses.creditManager,
      )
      const swapperBase = new MarsSwapperBaseClient(
        signingClient,
        address,
        contractAddresses.swapper,
      )

      set(() => ({
        clients: {
          accountNft,
          creditManager,
          swapperBase,
        },
      }))
    },
    initialize: async (
      status: WalletConnectionStatus,
      signingCosmWasmClient?: WalletSigningCosmWasmClient,
      address?: string,
      name?: string,
      chainInfo?: WalletChainInfo,
    ) => {
      if (address && signingCosmWasmClient) {
        get().actions.initClients(address, signingCosmWasmClient)
      }

      set({
        signingClient: signingCosmWasmClient,
        address,
        status,
        name,
        chainInfo,
      })
    },
    setMetamaskInstalledStatus: (value: boolean) => set(() => ({ metamaskInstalled: value })),
  },
}))
