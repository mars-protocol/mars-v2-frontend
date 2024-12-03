import { create, StoreApi, UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import createBroadcastSlice from 'store/slices/broadcast'
import createCommonSlice from 'store/slices/common'
import createModalSlice from 'store/slices/modal'

const store = (set: StoreApi<Store>['setState'], get: StoreApi<Store>['getState']) => ({
  ...createCommonSlice(set, get),
  ...createBroadcastSlice(set, get),
  ...createModalSlice(set, get),
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
