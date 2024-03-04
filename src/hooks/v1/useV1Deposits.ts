import useSWR from 'swr'

import getV1Deposits from 'api/v1/getV1Deposits'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'

export default function useV1Deposits() {
  const isV1 = useStore((s) => s.isV1)

  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  return useSWR(
    !!address && isV1 && `${chainConfig.id}/v1/deposits/${address}`,
    () => getV1Deposits(chainConfig, address ?? ''),
    {
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
