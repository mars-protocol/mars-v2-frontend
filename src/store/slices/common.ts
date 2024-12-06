import Osmosis1 from 'chains/osmosis/osmosis-1'
import { StoreApi } from 'zustand'

export default function createCommonSlice(
  set: StoreApi<Store>['setState'],
  get: StoreApi<Store>['getState'],
) {
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
    isV1: false,
    assets: [],
    hlsBorrowAmount: null,
    errorStore: { apiError: null, nodeError: null },
    creditManagerConfig: null,
  }
}
