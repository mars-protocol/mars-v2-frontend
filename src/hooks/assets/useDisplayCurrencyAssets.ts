import useAllAssets from 'hooks/assets/useAllAssets'

export default function useDisplayCurrencyAssets() {
  const assets = useAllAssets()

  return assets.filter((asset) => asset.isDisplayCurrency)
}
