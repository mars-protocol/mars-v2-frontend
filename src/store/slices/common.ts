import { WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { GetState, SetState } from 'zustand'

export default function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    balances: [],
    creditAccounts: null,
    isOpen: true,
    selectedAccount: null,
    slippage: 0.02,
    status: WalletConnectionStatus.Unconnected,
  }
}
