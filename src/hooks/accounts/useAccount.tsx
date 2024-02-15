import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'
import getV1Positions from 'api/v1/getV1Positions'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'

export default function useAccount(accountId?: string, suspense?: boolean) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const isV1 = accountId === address

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
