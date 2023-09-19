import useSWR from 'swr'

import getAccountIds from 'api/wallets/getAccountIds'

export default function useAccountIds(address?: string) {
  return useSWR(`wallets/${address}/account-ids`, () => getAccountIds(address), {
    suspense: true,
    fallback: [],
    revalidateOnFocus: false,
  })
}
