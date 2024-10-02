import getPerpsPosition from 'api/perps/getPerpsPosition'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'

export default function useUpdatePerpsPosition(
  denom: string,
  orderSize: BigNumber,
  accountId: string,
) {
  const chainConfig = useChainConfig()
  return useSWR(
    `chains/${chainConfig.id}/perps/updatePosition/${denom}/${accountId}`,
    () => getPerpsPosition(chainConfig, denom, orderSize.toString(), accountId),
    {
      revalidateOnFocus: true,
    },
  )
}
