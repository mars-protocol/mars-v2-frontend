import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'

import Button from 'components/Button'
import SummaryItems from 'components/SummaryItems'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getNoBalanceInWalletMessage } from 'utils/messages'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

export default function Repay(props: Props) {
  const { removeDebts, removedDebts } = useUpdatedAccount(props.account)
  const borrowAssetAmountInWallet = BN(
    useCurrentWalletBalance(props.borrowAsset.denom)?.amount || '0',
  )
  const repay = useStore((s) => s.repay)

  const currentDebt: BigNumber = useMemo(
    () => props.account.debts.find(byDenom(props.borrowAsset.denom)).amount || BN_ZERO,
    [props.account.debts, props.borrowAsset.denom],
  )

  const repayAmount: BigNumber = useMemo(
    () => removedDebts.find(byDenom(props.borrowAsset.denom))?.amount || BN_ZERO,
    [removedDebts, props.borrowAsset.denom],
  )

  const maxRepayAmount = useMemo(
    () => BigNumber.min(borrowAssetAmountInWallet.toNumber(), currentDebt),
    [borrowAssetAmountInWallet, currentDebt],
  )

  const items: SummaryItem[] = useMemo(
    () => [
      {
        title: 'Total Debt Repayable',
        amount: currentDebt.toNumber(),
        options: {
          suffix: ` ${props.borrowAsset.symbol}`,
          abbreviated: true,
          decimals: props.borrowAsset.decimals,
        },
      },
      {
        title: 'New Debt Amount',
        amount: currentDebt.minus(repayAmount).toNumber(),
        options: {
          suffix: ` ${props.borrowAsset.symbol}`,
          abbreviated: true,
          decimals: props.borrowAsset.decimals,
        },
      },
    ],
    [currentDebt, props.borrowAsset.decimals, props.borrowAsset.symbol, repayAmount],
  )

  const handleRepay = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
    repay({
      accountId: props.account.id,
      coin: BNCoin.fromDenomAndBigNumber(props.borrowAsset.denom, repayAmount),
      fromWallet: true,
    })
  }, [props.account.id, props.borrowAsset.denom, repay, repayAmount])

  const handleOnChange = useCallback(
    (amount: BigNumber) =>
      removeDebts([BNCoin.fromDenomAndBigNumber(props.borrowAsset.denom, amount)]),
    [props.borrowAsset.denom, removeDebts],
  )

  const warningMessages = useMemo(() => {
    if (borrowAssetAmountInWallet.isZero()) {
      return [getNoBalanceInWalletMessage(props.borrowAsset.symbol)]
    }
    return []
  }, [borrowAssetAmountInWallet, props.borrowAsset.symbol])

  return (
    <>
      <TokenInputWithSlider
        amount={repayAmount}
        asset={props.borrowAsset}
        max={maxRepayAmount}
        onChange={handleOnChange}
        maxText='In Wallet'
        warningMessages={warningMessages}
      />
      <div className='flex flex-col gap-4'>
        <SummaryItems items={items} />
        <Button
          onClick={handleRepay}
          text='Repay'
          disabled={warningMessages.length !== 0 || repayAmount.isZero()}
        />
      </div>
    </>
  )
}
