import useSWR from 'swr'

import getAccountIds from 'api/wallets/getAccountIds'

export default function useAccountIdsAndKinds(address?: string, suspense = true, noHls = false) {
  return useSWR(
    `wallets/${address}/account-ids${noHls && '-without-hls'}`,
    () =>
      getAccountIds(address).then((accountIdsAndKinds) => {
        if (noHls) {
          return accountIdsAndKinds
            .filter((accountIdAndKind) => accountIdAndKind.kind !== 'high_levered_strategy')
            .map((a) => a.id)
        }
        return accountIdsAndKinds.map((a) => a.id)
      }),
    {
      suspense: suspense,
      fallback: [] as string[],
      revalidateOnFocus: false,
    },
  )
}
