import useAllAssets from 'hooks/assets/useAllAssets'

export default function useDisplayCurrencyAssets() {
  const { data: assets } = useAllAssets()

  return assets.filter((asset) => asset.isDisplayCurrency)
}
