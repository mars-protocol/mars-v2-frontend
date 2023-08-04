import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAmount } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { hardcodedFee } from 'utils/constants'

interface Props {
  account: Account
  setChange: (change: AccountChange | undefined) => void
}

export default function FundAccount(props: Props) {
  const { account, setChange } = props
  const deposit = useStore((s) => s.deposit)
  const balances = useStore((s) => s.balances)
  const defaultAsset = ASSETS.find(byDenom(balances[0].denom)) ?? ASSETS[0]
  const [isConfirming, setIsConfirming] = useToggle()
  const [currentAsset, setCurrentAsset] = useState(defaultAsset)
  const [amount, setAmount] = useState(BN_ZERO)
  const depositAmount = BN_ZERO.plus(amount)
  const max = getAmount(currentAsset.denom, balances ?? [])

  function onChangeAmount(val: BigNumber) {
    setAmount(val)
    setChange({
      deposits: [
        {
          amount: depositAmount.toString(),
          denom: currentAsset.denom,
        },
      ],
    })
  }

  function resetState() {
    setCurrentAsset(defaultAsset)
    setAmount(BN_ZERO)
    setChange(undefined)
  }

  async function onConfirm() {
    setIsConfirming(true)
    const result = await deposit({
      fee: hardcodedFee,
      accountId: account.id,
      coins: [BNCoin.fromDenomAndBigNumber(currentAsset.denom, amount)],
    })

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ fundAndWithdrawModal: null })
    }
  }

  return (
    <>
      <TokenInputWithSlider
        asset={currentAsset}
        onChange={onChangeAmount}
        onChangeAsset={setCurrentAsset}
        amount={amount}
        max={max}
        className='w-full'
        balances={balances}
        hasSelect
        maxText='Max'
        disabled={isConfirming}
      />
      <Button
        onClick={onConfirm}
        showProgressIndicator={isConfirming}
        className='w-full'
        text={'Fund'}
        rightIcon={<ArrowRight />}
      />
    </>
  )
}
