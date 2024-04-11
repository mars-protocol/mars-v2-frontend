import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { BNCoin } from 'classes/BNCoin'
import Button from 'components/common/Button'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useToggle from 'hooks/common/useToggle'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useStore from 'store'
import { cloneAccount, getMergedBalancesForAsset, removeDepositsAndLends } from 'utils/accounts'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
}

export default function WithdrawFromAccount(props: Props) {
  const { account } = props
  const assets = useAllAssets()
  const defaultAsset =
    assets.find(byDenom(account.deposits[0]?.denom || account.lends[0]?.denom)) ?? assets[0]
  const withdraw = useStore((s) => s.withdraw)
  const [withdrawWithBorrowing, setWithdrawWithBorrowing] = useToggle()
  const [currentAsset, setCurrentAsset] = useState(defaultAsset)
  const [amount, setAmount] = useState(BN_ZERO)
  const { simulateWithdraw } = useUpdatedAccount(account)
  const { computeMaxWithdrawAmount } = useHealthComputer(account)
  const accountClone = cloneAccount(account)
  const borrowAccount = removeDepositsAndLends(accountClone, currentAsset.denom)
  const { computeMaxBorrowAmount } = useHealthComputer(borrowAccount)
  const marketEnabledAssets = useMarketEnabledAssets()
  const balances = getMergedBalancesForAsset(account, marketEnabledAssets)
  const maxWithdrawAmount = computeMaxWithdrawAmount(currentAsset.denom)
  const maxWithdrawWithBorrowAmount = computeMaxBorrowAmount(currentAsset.denom, 'wallet').plus(
    maxWithdrawAmount,
  )
  const isWithinBalance = amount.isLessThan(maxWithdrawAmount)
  const withdrawAmount = isWithinBalance ? amount : maxWithdrawAmount
  const debtAmount = isWithinBalance ? BN_ZERO : amount.minus(maxWithdrawAmount)
  const max = withdrawWithBorrowing ? maxWithdrawWithBorrowAmount : maxWithdrawAmount

  const accountDeposit = account.deposits.find(byDenom(currentAsset.denom))?.amount ?? BN_ZERO
  const accountLent = account.lends.find(byDenom(currentAsset.denom))?.amount ?? BN_ZERO
  const shouldReclaim = amount.isGreaterThan(accountDeposit) && !accountLent.isZero()
  const isReclaimingMaxAmount = accountLent.isLessThanOrEqualTo(amount.minus(accountDeposit))

  const reclaimAmount = isReclaimingMaxAmount ? amount : amount.minus(accountDeposit)

  function onChangeAmount(val: BigNumber) {
    setAmount(val)
  }

  function onConfirm() {
    const coins = [
      {
        coin: BNCoin.fromDenomAndBigNumber(currentAsset.denom, amount),
        isMax: max.isEqualTo(amount),
      },
    ]
    const borrow = !debtAmount.isZero()
      ? [BNCoin.fromDenomAndBigNumber(currentAsset.denom, debtAmount)]
      : []
    const reclaims =
      shouldReclaim && !reclaimAmount.isZero()
        ? [
            BNCoin.fromDenomAndBigNumber(currentAsset.denom, reclaimAmount).toActionCoin(
              isReclaimingMaxAmount,
            ),
          ]
        : []

    withdraw({
      accountId: account.id,
      coins,
      borrow,
      reclaims,
    })
    useStore.setState({ fundAndWithdrawModal: null })
  }

  const onDebounce = useCallback(() => {
    const coin = BNCoin.fromDenomAndBigNumber(currentAsset.denom, withdrawAmount.plus(debtAmount))
    simulateWithdraw(withdrawWithBorrowing, coin)
  }, [withdrawWithBorrowing, currentAsset.denom, debtAmount, simulateWithdraw, withdrawAmount])

  return (
    <>
      <div className='flex flex-wrap w-full'>
        <TokenInputWithSlider
          asset={currentAsset}
          onChange={onChangeAmount}
          onDebounce={onDebounce}
          onChangeAsset={(asset) => {
            setAmount(BN_ZERO)
            setWithdrawWithBorrowing(false)
            setCurrentAsset(asset)
          }}
          amount={amount}
          max={max}
          className='w-full'
          balances={balances}
          accountId={account.id}
          hasSelect
          maxText='Max'
          warningMessages={[]}
        />
        <Divider className='my-6' />
        <div className='flex flex-wrap w-full'>
          <div className='flex flex-wrap flex-1'>
            <Text className='w-full mb-1'>Withdraw with borrowing</Text>
            <Text size='xs' className='text-white/50'>
              Borrow assets from your Credit Account to withdraw to your wallet
            </Text>
          </div>
          <div className='flex flex-wrap items-center justify-end'>
            <Switch
              name='borrow-to-wallet'
              checked={withdrawWithBorrowing}
              onChange={setWithdrawWithBorrowing}
            />
          </div>
        </div>
      </div>
      <Button onClick={onConfirm} className='w-full' text={'Withdraw'} rightIcon={<ArrowRight />} />
    </>
  )
}
