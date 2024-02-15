import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'
import getV1Positions from 'api/v1/getV1Positions'
import useChainConfig from 'hooks/useChainConfig'

export default function useAccount(accountId?: string, suspense?: boolean) {
  const chainConfig = useChainConfig()
  const isV1 = isNaN(parseInt(accountId || ''))

  const cacheKey = isV1
    ? `chains/${chainConfig.id}/v1/user/${accountId}`
    : `chains/${chainConfig.id}/accounts/${accountId}`

  return useSWR(
    accountId && cacheKey,
    () => (isV1 ? getV1Positions(chainConfig, accountId) : getAccount(chainConfig, accountId)),
    {
      suspense: suspense,
      revalidateOnFocus: false,
    },
  )
}
