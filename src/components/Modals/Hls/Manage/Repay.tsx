import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'

import Button from 'components/common/Button'
import SummaryItems from 'components/common/SummaryItems'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getNoBalanceInWalletMessage } from 'utils/messages'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowMarket: Market
  collateralAsset: Asset
}

export default function Repay(props: Props) {
  const { removeDebts, removedDebts } = useUpdatedAccount(props.account)
  const borrowAssetAmountInWallet = BN(
    useCurrentWalletBalance(props.borrowMarket.asset.denom)?.amount || '0',
  )
  const repay = useStore((s) => s.repay)

  const currentDebt: BigNumber = useMemo(
    () => props.account.debts.find(byDenom(props.borrowMarket.asset.denom))?.amount || BN_ZERO,
    [props.account.debts, props.borrowMarket.asset.denom],
  )

  const repayAmount: BigNumber = useMemo(
    () => removedDebts.find(byDenom(props.borrowMarket.asset.denom))?.amount || BN_ZERO,
    [removedDebts, props.borrowMarket.asset.denom],
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
          suffix: ` ${props.borrowMarket.asset.symbol}`,
          abbreviated: true,
          decimals: props.borrowMarket.asset.decimals,
        },
      },
      {
        title: 'New Debt Amount',
        amount: currentDebt.minus(repayAmount).toNumber(),
        options: {
          suffix: ` ${props.borrowMarket.asset.symbol}`,
          abbreviated: true,
          decimals: props.borrowMarket.asset.decimals,
        },
      },
    ],
    [currentDebt, props.borrowMarket.asset.decimals, props.borrowMarket.asset.symbol, repayAmount],
  )

  const handleRepay = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
    repay({
      accountId: props.account.id,
      coin: BNCoin.fromDenomAndBigNumber(props.borrowMarket.asset.denom, repayAmount),
      fromWallet: true,
    })
  }, [props.account.id, props.borrowMarket.asset.denom, repay, repayAmount])

  const handleOnChange = useCallback(
    (amount: BigNumber) =>
      removeDebts([BNCoin.fromDenomAndBigNumber(props.borrowMarket.asset.denom, amount)]),
    [props.borrowMarket.asset.denom, removeDebts],
  )

  const warningMessages = useMemo(() => {
    if (borrowAssetAmountInWallet.isZero()) {
      return [getNoBalanceInWalletMessage(props.borrowMarket.asset.symbol)]
    }
    return []
  }, [borrowAssetAmountInWallet, props.borrowMarket.asset.symbol])

  return (
    <>
      <TokenInputWithSlider
        amount={repayAmount}
        asset={props.borrowMarket.asset}
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
