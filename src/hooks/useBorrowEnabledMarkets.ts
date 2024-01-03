import useMarketAssets from 'hooks/markets/useMarketAssets'

export default function useBorrowEnabledMarkets() {
  const { data: markets } = useMarketAssets()
  return markets.filter((market) => market.borrowEnabled)
}
