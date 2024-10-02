import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'

export default function useAccount(accountId?: string, suspense?: boolean) {
  const { data: assets } = useAssets()
  const chainConfig = useChainConfig()
  const address = chainConfig.contracts.creditManager
  const isV1 = useStore((s) => s.isV1)

  const v1Account = useV1Account()
  const v2Account = useSWR(
    !!accountId && !isV1 && `chains/${chainConfig.id}/accounts/${accountId}`,
    () => getAccount(chainConfig, assets, accountId, address),
    {
      refreshInterval: 10_000,
      suspense: suspense,
      revalidateOnFocus: true,
    },
  )

  if (isV1) return v1Account

  return v2Account
}
