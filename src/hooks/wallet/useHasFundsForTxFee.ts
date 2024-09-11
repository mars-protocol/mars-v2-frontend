import { BN } from '../../utils/helpers'
import useBaseAsset from '../assets/useBasetAsset'
import useCurrentWalletBalance from './useCurrentWalletBalance'

export default function useHasFundsForTxFee() {
  const baseAsset = useBaseAsset()
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseAsset.denom)
  return transactionFeeCoinBalance && BN(transactionFeeCoinBalance.amount).isPositive()
}
