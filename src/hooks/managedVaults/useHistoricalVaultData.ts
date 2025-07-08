import getHistoricalManagedVaults from 'api/managedVaults/getHistoricalManagedVaults'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { BN } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'

export default function useHistoricalVaultData(vaultAddress: string, timeframe: number | 'all') {
  const chainConfig = useChainConfig()

  return useSWR(
    vaultAddress && chainConfig.endpoints.historicalManagedVaults
      ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/historical/${timeframe}`
      : null,
    async () => {
      const response = await getHistoricalManagedVaults(chainConfig, timeframe, vaultAddress)
      if (!response.data.length) return []

      const vaultData = response.data[0]
      return vaultData.tvl.map((point) => {
        const sharePricePoint = vaultData.share_price.find((sp) => sp.date === point.date)
        const aprPoint = vaultData.apr?.find((ap) => ap.date === point.date)

        return {
          date: point.date,
          tvl: Number(point.value),
          apy: aprPoint?.value ? convertAprToApy(Number(aprPoint.value), 365) : 0,
          sharePrice: sharePricePoint?.value
            ? BN(sharePricePoint.value).shiftedBy(PRICE_ORACLE_DECIMALS).toNumber()
            : 0,
        }
      })
    },
    {
      revalidateOnFocus: false,
      suspense: false,
    },
  )
}
