import chains from 'configs/chains'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { ChainInfoID } from 'types/enums/wallet'

export const getCurrentChainId = () => {
  let chainId = chains[ChainInfoID.Osmosis1].id

  if (window) {
    const subdomain = window.location.hostname.split('.')[0]

    switch (subdomain) {
      case 'osmosis':
        chainId = ChainInfoID.Osmosis1
        break

      case 'testnet-osmosis':
        chainId = ChainInfoID.OsmosisDevnet
        break

      case 'testnet-neutron':
        chainId = ChainInfoID.Pion1
        break
    }

    if (chainId != chains[ChainInfoID.Osmosis1].id) return chainId
  }

  const localStorageChainId = localStorage.getItem(LocalStorageKeys.CURRENT_CHAIN_ID)
  if (localStorageChainId !== null) {
    if (chains[chainId]) chainId = localStorageChainId as ChainInfoID
  }

  return chainId
}
