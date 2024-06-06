import { GetState, SetState } from 'zustand'

import Osmosis1 from 'chains/osmosis/osmosis-1'

export default function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    balances: [],
    chainConfig: Osmosis1,
    creditAccounts: null,
    hlsAccounts: null,
    isOpen: true,
    selectedAccount: null,
    focusComponent: null,
    mobileNavExpanded: false,
    accountDetailsExpanded: false,
    migrationBanner: true,
    tutorial: true,
    useMargin: true,
    useAutoRepay: true,
    isOracleStale: false,
    isHLS: false,
    isV1: false,
    assets: [],
  }
}
