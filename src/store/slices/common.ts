import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { WalletClient, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { GetState, SetState } from 'zustand'

export interface CommonSlice {
  accounts: Account[] | null
  address?: string
  enableAnimations: boolean
  isOpen: boolean
  selectedAccount: string | null
  client?: WalletClient
  status: WalletConnectionStatus
}

export function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    creditAccounts: null,
    enableAnimations: true,
    isOpen: true,
    selectedAccount: null,
    status: WalletConnectionStatus.Unconnected,
  }
}
