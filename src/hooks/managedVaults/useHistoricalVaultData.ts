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

      const initialSharePrice = Number(vaultData.share_price[0].value)
      const transformedData = vaultData.tvl.map((point, index) => {
        const currentSharePrice = Number(vaultData.share_price[index].value)
        const normalizedSharePrice = currentSharePrice / initialSharePrice

        return {
          date: point.date,
          tvl: Number(point.value),
          apy: convertAprToApy(Number(vaultData.apr[index].value), 365),
          sharePrice: normalizedSharePrice,
        }
      })

      return transformedData
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )
}
