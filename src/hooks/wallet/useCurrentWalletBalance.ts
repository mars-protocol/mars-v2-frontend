import useStore from 'store'
import { byDenom } from 'utils/array'
import useWalletBalances from './useWalletBalances'

function useCurrentWalletBalance(denom: string) {
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)

  return walletBalances.find(byDenom(denom))
}

export default useCurrentWalletBalance
