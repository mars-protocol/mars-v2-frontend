import useSWR from 'swr'

import getAccountIds from 'api/wallets/getAccountIds'

export default function useAccountIdsAndKinds(address?: string, suspense = true) {
  return useSWR(
    `wallets/${address}/account-ids`,
    () => getAccountIds(address).then((accountIdsAndKinds) => accountIdsAndKinds.map((a) => a.id)),
    {
      suspense: suspense,
      fallback: [] as string[],
      revalidateOnFocus: false,
    },
  )
}
