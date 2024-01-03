import useStore from 'store'

export default function useDisplayCurrencyAssets() {
  const assets = useStore((s) => s.chainConfig.assets)

  return assets.filter((asset) => asset.isDisplayCurrency)
}
