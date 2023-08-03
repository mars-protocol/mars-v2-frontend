import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Button from 'components/Button'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import useHealthComputer from 'hooks/useHealthComputer'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { removeDepositFromAccount } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { hardcodedFee } from 'utils/constants'

interface Props {
  account: Account
  setChange: (change: AccountChange | undefined) => void
}

export default function WithdrawFromAccount(props: Props) {
  const { account, setChange } = props
  const defaultAsset = ASSETS.find(byDenom(account.deposits[0].denom)) ?? ASSETS[0]
  const withdraw = useStore((s) => s.withdraw)
  const [withdrawWithBorrowing, setWithdrawWithBorrowing] = useToggle()
  const [isConfirming, setIsConfirming] = useToggle()
  const [currentAsset, setCurrentAsset] = useState(defaultAsset)
  const [amount, setAmount] = useState(BN_ZERO)
  const updatedAccount = removeDepositFromAccount(account, currentAsset)
  const { computeMaxWithdrawAmount } = useHealthComputer(account)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)
  const maxWithdrawAmount = computeMaxWithdrawAmount(currentAsset.denom)
  const maxWithdrawWithBorrowAmount = computeMaxBorrowAmount(currentAsset.denom, 'wallet').plus(
    maxWithdrawAmount,
  )
  const isWithinBalance = amount.isLessThan(maxWithdrawAmount)
  const depositAmount = isWithinBalance ? BN_ZERO.minus(amount) : BN_ZERO.minus(maxWithdrawAmount)
  const debtAmount = isWithinBalance ? BN_ZERO : amount.minus(maxWithdrawAmount)
  const max = withdrawWithBorrowing ? maxWithdrawWithBorrowAmount : maxWithdrawAmount

  function onChangeAmount(val: BigNumber) {
    setAmount(val)
    setChange({
      deposits: [
        {
          amount: depositAmount.toString(),
          denom: currentAsset.denom,
        },
      ],
      debts: [{ amount: debtAmount.toString(), denom: currentAsset.denom }],
    })
  }

  function resetState() {
    setCurrentAsset(defaultAsset)
    setAmount(BN_ZERO)
    setChange(undefined)
  }

  async function onConfirm() {
    setIsConfirming(true)
    const result = await withdraw({
      fee: hardcodedFee,
      accountId: account.id,
      coins: [BNCoin.fromDenomAndBigNumber(currentAsset.denom, amount)],
      borrow: debtAmount.isZero()
        ? []
        : [BNCoin.fromDenomAndBigNumber(currentAsset.denom, debtAmount)],
    })

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ fundAndWithdrawModal: null })
    }
  }

  return (
    <>
      <div className='flex w-full flex-wrap'>
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
        <div className='flex w-full flex-wrap'>
          <div className='flex flex-1 flex-wrap'>
            <Text className='mb-1 w-full'>Withdraw with borrowing</Text>
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
