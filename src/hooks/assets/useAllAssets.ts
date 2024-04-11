import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAllAssets() {
  const chainConfig = useChainConfig()
  return chainConfig.assets
}
