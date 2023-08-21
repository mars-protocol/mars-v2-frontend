import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'

export default function useAccounts(accountId?: string) {
  return useSWR(`account${accountId}`, () => getAccount(accountId || ''), {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  })
}
