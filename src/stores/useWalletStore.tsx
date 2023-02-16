import { WalletClient, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import create from 'zustand'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { networkConfig } from 'config/osmo-test-4'
import { MarsAccountNftClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsSwapperBaseClient } from 'types/generated/mars-swapper-base/MarsSwapperBase.client'

interface WalletStore {
  address?: string
  client?: WalletClient
  name?: string
  status: WalletConnectionStatus
  signingClient?: SigningCosmWasmClient
  clients: {
    accountNft?: MarsAccountNftClient
    creditManager?: MarsCreditManagerClient
    swapperBase?: MarsSwapperBaseClient
  }
  actions: {
    initClients: (address: string, signingClient: SigningCosmWasmClient) => void
    initialize: (
      status: WalletConnectionStatus,
      signingCosmWasmClient?: SigningCosmWasmClient,
      address?: string,
      name?: string,
    ) => void
  }
}

export const useWalletStore = create<WalletStore>()((set, get) => ({
  status: WalletConnectionStatus.Unconnected,
  clients: {},
  actions: {
    // TODO: work with slices in one global store instead
    initClients: (address, signingClient) => {
      if (!signingClient) return
      const accountNft = new MarsAccountNftClient(
        signingClient,
        address,
        networkConfig.contracts.accountNft,
      )
      const creditManager = new MarsCreditManagerClient(
        signingClient,
        address,
        networkConfig.contracts.creditManager,
      )
      const swapperBase = new MarsSwapperBaseClient(
        signingClient,
        address,
        networkConfig.contracts.swapper,
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
      signingCosmWasmClient?: SigningCosmWasmClient,
      address?: string,
      name?: string,
    ) => {
      if (address && signingCosmWasmClient) {
        get().actions.initClients(address, signingCosmWasmClient)
      }

      set({
        signingClient: signingCosmWasmClient,
        address,
        status,
        name,
      })
    },
  },
}))
