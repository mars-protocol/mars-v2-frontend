import useSWR from 'swr'

import getAccounts from 'api/wallets/getAccounts'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAccounts(kind: AccountKind, address?: string, suspense = true) {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

  return useSWR(
    !!address && `chains/${chainConfig.id}/accounts/${kind}`,
    () => getAccounts(kind, chainConfig, assets, address),
    {
      suspense: suspense,
      fallbackData: [],
      revalidateOnFocus: true,
    },
  )
}
