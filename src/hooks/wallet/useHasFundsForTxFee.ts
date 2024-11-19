import useBaseAsset from 'hooks/assets/useBaseAsset'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import { BN } from 'utils/helpers'

export default function useHasFundsForTxFee() {
  const baseAsset = useBaseAsset()
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseAsset.denom)
  return transactionFeeCoinBalance && BN(transactionFeeCoinBalance.amount).isPositive()
}
