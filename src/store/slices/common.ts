import { GetState, SetState } from 'zustand'

export default function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    balances: [],
    creditAccounts: null,
    isOpen: true,
    selectedAccount: null,
    focusComponent: null,
    accountDetailsExpanded: false,
  }
}
