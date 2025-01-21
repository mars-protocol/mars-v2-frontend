import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'

export default function useVaultAssets() {
  const assets = useWhitelistedAssets()
  const vaultAssets = assets.filter((asset) => !asset.isPoolToken && !asset.isDeprecated)

  return vaultAssets
}
