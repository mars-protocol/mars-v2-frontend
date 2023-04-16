import create, { GetState, SetState, StoreApi, UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import { BroadcastSlice, createBroadcastSlice } from 'store/slices/broadcast'
import { CommonSlice, createCommonSlice } from 'store/slices/common'
import { createCurrencySlice, CurrencySlice } from 'store/slices/currency'
import { createModalSlice, ModalSlice } from 'store/slices/modal'

export interface Store extends CommonSlice, BroadcastSlice, CurrencySlice, ModalSlice {}

const store = (set: SetState<any>, get: GetState<any>) => ({
  ...createCommonSlice(set, get),
  ...createBroadcastSlice(set, get),
  ...createCurrencySlice(set, get),
  ...createModalSlice(set, get),
})

let useStore: UseBoundStore<StoreApi<Store>>

if (process.env.NODE_ENV !== 'production') {
  useStore = create(devtools(store))
} else {
  useStore = create<Store>(store)
}

export default useStore
