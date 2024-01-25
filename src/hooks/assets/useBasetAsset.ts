import useStore from 'store'

export default function useBaseAsset() {
  const assets = useStore((s) => s.chainConfig.assets)

  return assets[0]
}
