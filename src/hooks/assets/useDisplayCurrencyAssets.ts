import useAssets from 'hooks/assets/useAssets'

export default function useDisplayCurrencyAssets() {
  const { data: assets } = useAssets()

  return assets.filter((asset) => asset.isDisplayCurrency)
}
