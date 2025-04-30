import Neutron1 from 'chains/neutron/neutron-1'
import { StoreApi } from 'zustand'

export default function createCommonSlice(
  set: StoreApi<Store>['setState'],
  get: StoreApi<Store>['getState'],
) {
  return {
    accounts: null,
    balances: [],
    chainConfig: Neutron1,
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
    conditionalTriggerOrders: {
      tp: null,
      sl: null,
    },
    perpsTradeDirection: 'long' as TradeDirection,
  }
}
