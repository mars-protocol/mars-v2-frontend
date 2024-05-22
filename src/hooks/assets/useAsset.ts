import useAllChainAssets from 'hooks/assets/useAllChainAssets'
import { byDenom, bySymbol } from 'utils/array'

export default function useAsset(denomOrSymbol: string) {
  const { data: assets } = useAllChainAssets()

  return assets.find(byDenom(denomOrSymbol)) ?? assets.find(bySymbol(denomOrSymbol))
}
