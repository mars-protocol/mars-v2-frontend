import useSWR from 'swr'
import getHistoricalManagedVaults from 'api/managedVaults/getHistoricalManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import { convertAprToApy } from 'utils/parsers'

export default function useHistoricalVaultData(vaultAddress: string, timeframe: number) {
  const chainConfig = useChainConfig()

  return useSWR(
    vaultAddress && chainConfig.endpoints.historicalManagedVaults
      ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/historical/${timeframe}`
      : null,
    async () => {
      const response = await getHistoricalManagedVaults(chainConfig, timeframe, vaultAddress)
      if (!response.data.length) return []

      const vaultData = response.data[0]
      const initialSharePrice =
        vaultData.share_price.find((point) => Number(point?.value) > 0)?.value ?? '1'

      const transformedData = vaultData.tvl
        .map((point, index) => {
          // Skipping points with missing data
          if (!point?.value || !vaultData.share_price[index]?.value) {
            return null
          }

          const currentSharePrice = Number(vaultData.share_price[index].value)
          const normalizedSharePrice =
            currentSharePrice > 0 ? currentSharePrice / Number(initialSharePrice) : 0

          return {
            date: point.date,
            tvl: Number(point.value),
            apy:
              vaultData.apr && vaultData.apr[index]?.value
                ? convertAprToApy(Number(vaultData.apr[index].value), 365)
                : 0,
            sharePrice: normalizedSharePrice,
          }
        })
        .filter(Boolean)

      return transformedData as HistoricalVaultChartData[]
    },
    {
      revalidateOnFocus: false,
      suspense: false,
    },
  )
}
