import useChainConfig from 'hooks/useChainConfig'

export default function useBaseAsset() {
  const chainConfig = useChainConfig()
  const assets = chainConfig.assets

  return assets[0]
}
