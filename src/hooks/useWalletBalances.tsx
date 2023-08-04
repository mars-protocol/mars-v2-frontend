import useSWR from 'swr'

import getWalletBalances from 'api/wallets/getWalletBalances'

export default function useWalletBalances(address?: string) {
  return useSWR(`walletBalances${address}`, () => getWalletBalances(address || ''), {
    isPaused: () => !address,
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
