import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'

export default function useDisplayCurrencyAssets() {
  const assets = useAllWhitelistedAssets()

  return assets.filter((asset) => asset.isDisplayCurrency)
}
