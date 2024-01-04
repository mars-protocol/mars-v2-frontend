import chains from 'configs/chains'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'

export const getCurrentChainId = () => {
  const currentNetwork = process.env.NEXT_PUBLIC_NETWORK ?? NETWORK.TESTNET
  const defaultChainId =
    currentNetwork === NETWORK.MAINNET
      ? chains[ChainInfoID.Osmosis1].id
      : chains[ChainInfoID.OsmosisDevnet].id
  let chainId = defaultChainId

  if (window) {
    const subdomain = window.location.hostname.split('.')[0]

    switch (subdomain) {
      case 'osmosis':
        if (currentNetwork === NETWORK.MAINNET) chainId = ChainInfoID.Osmosis1
        break

      case 'testnet-osmosis':
        if (currentNetwork === NETWORK.TESTNET) chainId = ChainInfoID.OsmosisDevnet
        break

      case 'testnet-neutron':
        if (currentNetwork === NETWORK.TESTNET) chainId = ChainInfoID.Pion1
        break
    }

    if (chainId !== defaultChainId) return chainId
  }

  const localStorageChainId = localStorage.getItem(LocalStorageKeys.CURRENT_CHAIN_ID) as ChainInfoID
  if (localStorageChainId !== null) {
    switch (localStorageChainId) {
      case ChainInfoID.Osmosis1:
        if (currentNetwork === NETWORK.MAINNET) chainId = ChainInfoID.Osmosis1
        break

      case ChainInfoID.OsmosisDevnet:
        if (currentNetwork === NETWORK.TESTNET) chainId = ChainInfoID.OsmosisDevnet
        break

      case ChainInfoID.Pion1:
        if (currentNetwork === NETWORK.TESTNET) chainId = ChainInfoID.Pion1
        break
    }
  }

  return chainId
}
