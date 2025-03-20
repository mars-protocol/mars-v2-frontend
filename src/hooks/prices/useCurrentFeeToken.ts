import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import useChainConfig from 'hooks/chain/useChainConfig'
import { getTransactionFeeToken } from 'utils/feeToken'

export default function useCurrentFeeToken() {
  const address = useStore((s) => s.address)
  const { data: walletBalances = [] } = useWalletBalances(address)
  const chainConfig = useChainConfig()

  const usdcDenom = chainConfig.stables[0]
  const nativeDenom = chainConfig.defaultCurrency.coinMinimalDenom

  return getTransactionFeeToken(walletBalances, usdcDenom, nativeDenom)
}
