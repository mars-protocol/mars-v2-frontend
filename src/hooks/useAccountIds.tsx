import useSWR from 'swr'

import getAccountIds from 'api/wallets/getAccountIds'

export default function useAccountIds(address?: string, suspense = true) {
  return useSWR(`wallets/${address}/account-ids`, () => getAccountIds(address), {
    suspense: suspense,
    fallback: [] as string[],
    revalidateOnFocus: false,
  })
}
