import useSWR from 'swr'

import getWalletBalances from 'api/wallets/getWalletBalances'

export default function useWalletBalances(address?: string) {
  return useSWR(`walletBalances${address}`, () => getWalletBalances(address || ''), {
    suspense: true,
    isPaused: () => !address,
  })
}
