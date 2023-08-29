import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Button from 'components/Button'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import useHealthComputer from 'hooks/useHealthComputer'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
}

export default function WithdrawFromAccount(props: Props) {
  const { account } = props
  const defaultAsset =
    ASSETS.find(byDenom(account.deposits[0]?.denom || account.lends[0]?.denom)) ?? ASSETS[0]
  const withdraw = useStore((s) => s.withdraw)
  const [withdrawWithBorrowing, setWithdrawWithBorrowing] = useToggle()
  const [isConfirming, setIsConfirming] = useToggle()
  const [currentAsset, setCurrentAsset] = useState(defaultAsset)
  const [amount, setAmount] = useState(BN_ZERO)
  const { updatedAccount, removeDeposits, removeLends, addDebts } = useUpdatedAccount(account)
  const { computeMaxWithdrawAmount } = useHealthComputer(account)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)
  const maxWithdrawAmount = computeMaxWithdrawAmount(currentAsset.denom)
  const maxWithdrawWithBorrowAmount = computeMaxBorrowAmount(currentAsset.denom, 'wallet').plus(
    maxWithdrawAmount,
  )
  const isWithinBalance = amount.isLessThan(maxWithdrawAmount)
  const withdrawAmount = isWithinBalance ? amount : maxWithdrawAmount
  const debtAmount = isWithinBalance ? BN_ZERO : amount.minus(maxWithdrawAmount)
  const max = withdrawWithBorrowing ? maxWithdrawWithBorrowAmount : maxWithdrawAmount

  const accountDeposit = account.deposits.find(byDenom(currentAsset.denom))?.amount ?? BN_ZERO
  const shouldReclaim =
    amount.isGreaterThan(accountDeposit) && !withdrawWithBorrowing && currentAsset.isAutoLendEnabled
  const reclaimAmount = shouldReclaim ? amount.minus(accountDeposit) : BN_ZERO
  const isReclaimingMaxAmount = maxWithdrawAmount.isEqualTo(amount)

  function onChangeAmount(val: BigNumber) {
    setAmount(val)
    removeDeposits([BNCoin.fromDenomAndBigNumber(currentAsset.denom, withdrawAmount)])
    addDebts([BNCoin.fromDenomAndBigNumber(currentAsset.denom, debtAmount)])
    removeLends([BNCoin.fromDenomAndBigNumber(currentAsset.denom, reclaimAmount)])
  }

  function resetState() {
    setCurrentAsset(defaultAsset)
    setAmount(BN_ZERO)
  }

  async function onConfirm() {
    setIsConfirming(true)

    const coins = [BNCoin.fromDenomAndBigNumber(currentAsset.denom, amount)]
    const borrow = !debtAmount.isZero()
      ? [BNCoin.fromDenomAndBigNumber(currentAsset.denom, debtAmount)]
      : []
    const reclaims = !reclaimAmount.isZero()
      ? [
          BNCoin.fromDenomAndBigNumber(currentAsset.denom, reclaimAmount).toActionCoin(
            isReclaimingMaxAmount,
          ),
        ]
      : []

    const result = await withdraw({
      accountId: account.id,
      coins,
      borrow,
      reclaims,
    })

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ fundAndWithdrawModal: null })
    }
  }

  return (
    <>
      <div className='flex flex-wrap w-full'>
        <TokenInputWithSlider
          asset={currentAsset}
          onChange={onChangeAmount}
          onChangeAsset={setCurrentAsset}
          amount={amount}
          max={max}
          className='w-full'
          balances={account.deposits}
          accountId={account.id}
          hasSelect={account.deposits.length > 1}
          maxText='Max'
          disabled={isConfirming}
        />
        <Divider className='my-6' />
        <div className='flex flex-wrap w-full'>
          <div className='flex flex-wrap flex-1'>
            <Text className='w-full mb-1'>Withdraw with borrowing</Text>
            <Text size='xs' className='text-white/50'>
              Borrow assets from your credit account to withdraw to your wallet
            </Text>
          </div>
          <div className='flex flex-wrap items-center justify-end'>
            <Switch
              name='borrow-to-wallet'
              checked={withdrawWithBorrowing}
              onChange={setWithdrawWithBorrowing}
              disabled={isConfirming}
            />
          </div>
        </div>
      </div>
      <Button
        onClick={onConfirm}
        showProgressIndicator={isConfirming}
        className='w-full'
        text={'Withdraw'}
        rightIcon={<ArrowRight />}
      />
    </>
  )
}
