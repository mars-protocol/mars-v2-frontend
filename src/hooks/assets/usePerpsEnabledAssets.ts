import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'

export default function usePerpsEnabledAssets() {
  const assets = useAllWhitelistedAssets()

  return assets.filter((asset) => asset.isPerpsEnabled)
}
