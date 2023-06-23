import useStore from 'store'
import useWalletBalances from 'hooks/useWalletBalances'
import { byDenom } from 'utils/array'

function useCurrentWalletBalance(denom: string) {
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)

  return walletBalances.find(byDenom(denom))
}

export default useCurrentWalletBalance
