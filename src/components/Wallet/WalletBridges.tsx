import useChainConfig from 'hooks/chain/useChainConfig'
import CosmosWalletBridges from 'components/Wallet/CosmosWalletBridges'
import EvmSupportedBridges from 'components/Wallet/EvmSupportedBridges'

export default function WalletBridges() {
  const chainConfig = useChainConfig()

  return chainConfig.evmAssetSupport ? <EvmSupportedBridges /> : <CosmosWalletBridges />
}
