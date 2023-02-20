import create from 'zustand'
import { networkConfig } from 'config/osmo-test-4'

// TODO: Create dynamic network import
export const useNetworkConfigStore = create<NetworkConfig>()(() => {
  return networkConfig
})
