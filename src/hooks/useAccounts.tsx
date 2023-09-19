import useSWR from 'swr'

import getAccounts from 'api/wallets/getAccounts'
import useStore from 'store'

export default function useAccounts(address?: string) {
  return useSWR(`accounts${address}`, () => getAccounts(address), {
    suspense: true,
    fallbackData: [],
    revalidateOnFocus: false,
    onSuccess: (accounts) => {
      useStore.setState({ accounts: accounts })
    },
  })
}
