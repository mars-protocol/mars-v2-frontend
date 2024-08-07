import useChainConfig from 'hooks/chain/useChainConfig'
import CosmosWalletBridges from './CosmosWalletBridges'
import NeutronEVMWalletBridges from './NeutronEVMWalletBridges'

export default function WalletBridges() {
  const chainConfig = useChainConfig()

  return chainConfig.evmAssetSupport ? <NeutronEVMWalletBridges /> : <CosmosWalletBridges />
}
