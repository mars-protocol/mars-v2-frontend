import useMarketAssets from 'hooks/markets/useMarketAssets'

export default function useDepositEnabledMarkets() {
  const { data: markets } = useMarketAssets()
  return markets.filter((market) => market.depositEnabled)
}
