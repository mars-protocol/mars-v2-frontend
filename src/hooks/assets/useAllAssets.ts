import useChainConfig from 'hooks/useChainConfig'

export default function useAllAssets() {
  const chainConfig = useChainConfig()
  return chainConfig.assets
}
