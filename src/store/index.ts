import { create, GetState, SetState, StoreApi, UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import createBroadcastSlice from 'store/slices/broadcast'
import createCommonSlice from 'store/slices/common'
import createCurrencySlice from 'store/slices/currency'
import createModalSlice from 'store/slices/modal'
import createSettingsSlice from 'store/slices/settings'

export interface Store
  extends CommonSlice,
    BroadcastSlice,
    CurrencySlice,
    ModalSlice,
    SettingsSlice {}

const store = (set: SetState<any>, get: GetState<any>) => ({
  ...createCommonSlice(set, get),
  ...createBroadcastSlice(set, get),
  ...createCurrencySlice(set, get),
  ...createModalSlice(set, get),
  ...createSettingsSlice(set, get),
})

interface UseStoreWithClear extends UseBoundStore<StoreApi<Store>> {
  /**
   * For tests only: Clears the state, and set it to an empty object.
   */
  clearState: () => {}
}
let useStore: UseBoundStore<StoreApi<Store>>

if (process.env.NODE_ENV === 'development') {
  useStore = create(devtools(store))
} else {
  useStore = create<Store>(store)
}

export default useStore as UseStoreWithClear
