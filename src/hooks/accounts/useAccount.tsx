import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'
import useChainConfig from 'hooks/useChainConfig'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'

export default function useAccount(accountId?: string, suspense?: boolean) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const isV1 = accountId === address

  const v1Account = useV1Account()
  const v2Account = useSWR(
    !!accountId && !isV1 && `chains/${chainConfig.id}/accounts/${accountId}`,
    () => getAccount(chainConfig, accountId),
    {
      suspense: suspense,
      revalidateOnFocus: false,
    },
  )

  if (isV1) return v1Account

  return v2Account
}
