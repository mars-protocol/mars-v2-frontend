import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'

export default function useBorrowEnabledAssets() {
  const assets = useAllWhitelistedAssets()

  return assets.filter((asset) => asset.isBorrowEnabled)
}
