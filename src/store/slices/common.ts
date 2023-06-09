import { WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { GetState, SetState } from 'zustand'

export default function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    balances: [],
    creditAccounts: null,
    enableAnimations: true,
    isOpen: true,
    selectedAccount: null,
    selectedBorrowDenoms: [],
    status: WalletConnectionStatus.Unconnected,
  }
}
