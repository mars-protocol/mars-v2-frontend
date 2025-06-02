import useSWR from 'swr'

import getAccountIds from 'api/wallets/getAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'
import { checkAccountKind } from 'utils/accounts'

export default function useAccountIds(
  address?: string,
  suspense = true,
  kind: AccountKind | 'fund_manager' | 'all' = 'all',
) {
  const chainConfig = useChainConfig()
  const fetchKey = typeof kind === 'string' ? kind : 'vaults'
  return useSWR(
    address && `chains/${chainConfig.id}/wallets/${address}/account-ids-${fetchKey}`,
    () =>
      getAccountIds(chainConfig, address).then((accountIdsAndKinds) => {
        if (kind === 'all') return accountIdsAndKinds.map((a) => a.id)

        return accountIdsAndKinds
          .filter((accountIdAndKind) => checkAccountKind(accountIdAndKind.kind) === kind)
          .map((a) => a.id)
      }),
    {
      refreshInterval: 30_000,
      suspense: suspense,
      fallback: [] as string[],
      revalidateOnFocus: true,
    },
  )
}
