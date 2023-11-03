import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'

export default function useAccount(accountId?: string, suspense?: boolean) {
  return useSWR(`account${accountId}`, () => getAccount(accountId), {
    suspense: suspense,
    revalidateOnFocus: false,
  })
}
