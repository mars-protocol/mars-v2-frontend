import useAssets from 'hooks/assets/useAssets'

export default function useDepositEnabledAssets() {
  const { data: assets } = useAssets()

  return assets.filter((asset) => asset.isDepositEnabled)
}
