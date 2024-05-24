import useAssets from 'hooks/assets/useAssets'

export default function useLendEnabledAssets() {
  const { data: assets } = useAssets()

  return assets.filter((asset) => asset.isAutoLendEnabled)
}
