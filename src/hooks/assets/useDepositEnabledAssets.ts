import useAllAssets from 'hooks/assets/useAllAssets'

export default function useDepositEnabledAssets() {
  const { data: assets } = useAllAssets()

  return assets.filter((asset) => asset.isDepositEnabled)
}
