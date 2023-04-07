import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { GetState, SetState } from 'zustand'

export interface CommonSlice {
  accounts: Account[] | null
  address?: string
  enableAnimations: boolean
  isOpen: boolean
  selectedAccount: string | null
  signingClient?: SigningCosmWasmClient
  status: WalletConnectionStatus
}

export function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    clients: {},
    creditAccounts: null,
    enableAnimations: true,
    isOpen: true,
    selectedAccount: null,
    status: WalletConnectionStatus.Unconnected,
  }
}
