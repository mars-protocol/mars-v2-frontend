import useSWR from 'swr'

import getV1Debts from 'api/v1/getV1Debts'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'

export default function useV1Debts() {
  const isV1 = useStore((s) => s.isV1)
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  return useSWR(
    !!address && isV1 && `${chainConfig.id}/v1/debts/${address}`,
    () => getV1Debts(chainConfig, address ?? ''),
    {
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
