import { WalletClient } from 'viem'
import { getWalletClient } from '@wagmi/core'
import { config } from 'config/ethereumConfig'
import { chainNameToUSDCAttributes } from 'utils/fetchUSDCBalance'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'

export function useEvmBridge() {
  const getEvmSigner = async (chainID: string) => {
    const evmWalletClient = (await getWalletClient(config, {
      chainId: parseInt(chainID),
    })) as WalletClient

    if (!evmWalletClient) {
      throw new Error(`getEVMSigner error: no wallet client available for chain ${chainID}`)
    }

    return evmWalletClient as any
  }

  const switchEvmChain = async (selectedAsset: WrappedBNCoin, chainConfig: ChainConfig) => {
    if (!selectedAsset.chain) throw new Error('Chain not found for selected asset')

    const expectedChainAttributes = chainNameToUSDCAttributes[selectedAsset.chain]
    if (!expectedChainAttributes) {
      throw new Error(`No chain attributes found for denom: ${selectedAsset.coin.denom}`)
    }

    if (chainConfig.id.toString() !== expectedChainAttributes.chainID.toString()) {
      const { switchChain } = await getWalletClient(config, {
        chainId: expectedChainAttributes.chainID,
      })

      if (switchChain) {
        await switchChain({ id: expectedChainAttributes.chainID })
      } else {
        throw new Error('Unable to switch network. Network switch function not available.')
      }
    }

    return expectedChainAttributes
  }

  return {
    getEvmSigner,
    switchEvmChain,
  }
}
