import useMarketBorrowings from 'hooks/useMarketBorrowings'
import { byDenom } from 'utils/array'

export default function useBorrowAsset(denom: string) {
  const { data: borrowAssets } = useMarketBorrowings()

  if (!borrowAssets.length) return null

  return borrowAssets.find(byDenom(denom))
}
