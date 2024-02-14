import useSWR from 'swr'

import getV1Positions from 'api/v1/getV1Positions'
import useChainConfig from 'hooks/useChainConfig'

export default function useV1Positions(user?: string, suspense?: boolean) {
  const chainConfig = useChainConfig()

  return useSWR(
    user && `chains/${chainConfig.id}/v1/${user}`,
    () => getV1Positions(chainConfig, user),
    {
      suspense: suspense,
      revalidateOnFocus: false,
    },
  )
}
