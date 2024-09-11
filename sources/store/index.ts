import { create, GetState, SetState, StoreApi, UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import createBroadcastSlice from './slices/broadcast'
import createCommonSlice from './slices/common'
import createModalSlice from './slices/modal'

const store = (set: SetState<any>, get: GetState<any>) => ({
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
