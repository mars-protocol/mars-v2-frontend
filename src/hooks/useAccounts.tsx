import useSWR from 'swr'

import getAccounts from 'api/wallets/getAccounts'

export default function useAccounts(address?: string) {
  return useSWR(`accounts${address}`, () => getAccounts(address || ''), {
    suspense: true,
    isPaused: () => !address,
    revalidateOnFocus: false,
  })
}
