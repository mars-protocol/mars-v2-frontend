import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAllWhitelistedAssets() {
  const chainConfig = useChainConfig()
  return chainConfig.assets
}
