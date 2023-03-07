import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { WalletClient, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { GetState, SetState } from 'zustand'

import { ENV } from 'constants/env'
import { MarsAccountNftClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsSwapperBaseClient } from 'types/generated/mars-swapper-base/MarsSwapperBase.client'

export interface WalletSlice {
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

export function createWalletSlice(set: SetState<WalletSlice>, get: GetState<WalletSlice>) {
  return {
    status: WalletConnectionStatus.Unconnected,
    clients: {},
    actions: {
      // TODO: work with slices in one global store instead
      initClients: (address: string, signingClient: SigningCosmWasmClient) => {
        if (!signingClient) return
        const accountNft = new MarsAccountNftClient(
          signingClient,
          address,
          ENV.ADDRESS_ACCOUNT_NFT || '',
        )
        const creditManager = new MarsCreditManagerClient(
          signingClient,
          address,
          ENV.ADDRESS_CREDIT_MANAGER || '',
        )
        const swapperBase = new MarsSwapperBaseClient(
          signingClient,
          address,
          ENV.ADDRESS_SWAPPER || '',
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
  }
}
