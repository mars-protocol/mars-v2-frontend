import { GetState, SetState } from 'zustand'

import Pion1 from 'configs/chains/neutron/pion-1'

export default function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    balances: [],
    chainConfig: Pion1,
    creditAccounts: null,
    hlsAccounts: null,
    isOpen: true,
    selectedAccount: null,
    focusComponent: null,
    accountDetailsExpanded: false,
    migrationBanner: true,
    tutorial: true,
    useMargin: true,
    useAutoRepay: true,
    isOracleStale: false,
    isHLS: false,
  }
}
