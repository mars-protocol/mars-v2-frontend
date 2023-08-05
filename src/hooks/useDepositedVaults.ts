import useSWR from 'swr'

import getDepositedVaults from 'api/vaults/getDepositedVaults'

export default function useDepositedVaults(accountId: string) {
  return useSWR(`depositedVaultsByAccount-${accountId}`, () => getDepositedVaults(accountId), {
    suspense: true,
    revalidateOnFocus: false,
  })
}
