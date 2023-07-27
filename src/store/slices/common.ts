import { GetState, SetState } from 'zustand'

import { ASSETS } from 'constants/assets'

export default function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    balances: [],
    creditAccounts: null,
    isOpen: true,
    selectedAccount: null,
    focusComponent: null,
  }
}
