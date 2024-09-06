import { GetState, SetState } from 'zustand'

import Osmosis1 from 'chains/osmosis/osmosis-1'

export default function createCommonSlice(set: SetState<CommonSlice>, get: GetState<CommonSlice>) {
  return {
    accounts: null,
    balances: [],
    chainConfig: Osmosis1,
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
    isHls: false,
    isVaults: false,
    isVaultsCreate: false,
    isV1: false,
    assets: [],
    hlsBorrowAmount: null,
    errorStore: { apiError: null, nodeError: null },
    creditManagerConfig: null,
  }
}
