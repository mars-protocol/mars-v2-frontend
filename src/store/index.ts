import create, { GetState, SetState, StoreApi, UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import { CommonSlice, createCommonSlice } from './slices/common'
import { createWalletSlice, WalletSlice } from './slices/wallet'

export interface Store extends CommonSlice, WalletSlice {}

const store = (set: SetState<any>, get: GetState<any>) => ({
  ...createCommonSlice(set, get),
  ...createWalletSlice(set, get),
})

let useStore: UseBoundStore<StoreApi<Store>>

if (process.env.NODE_ENV !== 'production') {
  useStore = create(devtools(store))
} else {
  useStore = create<Store>(store)
}

export default useStore
