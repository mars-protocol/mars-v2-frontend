import useSWR from 'swr'

import getV1Deposits from 'api/v1/getV1Deposits'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'

export default function useV1Deposits() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  return useSWR(
    !!address && `${chainConfig.id}/v1/deposits/${address}`,
    () => getV1Deposits(chainConfig, address ?? ''),
    {
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
