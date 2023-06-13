import BigNumber from 'bignumber.js'
import { useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import Button from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { getAmount } from 'utils/accounts'
import { hardcodedFee } from 'utils/contants'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
  isFunding: boolean
}

export default function FundWithdrawModalContent(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const withdraw = useStore((s) => s.withdraw)
  const deposit = useStore((s) => s.deposit)
  const balances = useStore((s) => s.balances)
  const [isConfirming, setIsConfirming] = useToggle()
  const [currentAsset, setCurrentAsset] = useState(baseCurrency)
  const [amount, setAmount] = useState(BN(0))
  const [change, setChange] = useState<AccountChange | undefined>()

  const max = props.isFunding
    ? getAmount(currentAsset.denom, balances ?? [])
    : props.account
    ? getAmount(currentAsset.denom, props.account.deposits)
    : BN(0)

  function onChangeAmount(val: BigNumber) {
    setAmount(val)
    setChange({
      deposits: [
        {
          amount: props.isFunding ? BN(0).plus(amount).toString() : BN(0).minus(amount).toString(),
          denom: currentAsset.denom,
        },
      ],
    })
  }

  function resetState() {
    setCurrentAsset(baseCurrency)
    setAmount(BN(0))
    setChange(undefined)
  }

  async function onConfirm() {
    setIsConfirming(true)
    let result
    if (props.isFunding) {
      result = await deposit({
        fee: hardcodedFee,
        accountId: props.account.id,
        coin: {
          denom: currentAsset.denom,
          amount: amount.toString(),
        },
      })
    } else {
      result = await withdraw({
        fee: hardcodedFee,
        accountId: props.account.id,
        coin: {
          denom: currentAsset.denom,
          amount: amount.toString(),
        },
      })
    }

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ fundAndWithdrawModal: null })
    }
  }

  return (
    <div className='flex flex-grow items-start gap-6 p-6'>
      <Card
        className='flex flex-grow bg-white/5 p-4'
        contentClassName='gap-6 flex flex-col justify-between h-full'
      >
        <TokenInputWithSlider
          asset={currentAsset}
          onChange={onChangeAmount}
          onChangeAsset={setCurrentAsset}
          amount={amount}
          max={max}
          balances={props.isFunding ? balances : props.account.deposits}
          accountId={!props.isFunding ? props.account.id : undefined}
          hasSelect
          maxText='Max'
        />
        <Divider />
        <Button
          onClick={onConfirm}
          showProgressIndicator={isConfirming}
          className='w-full'
          text={props.isFunding ? 'Fund' : 'Withdraw'}
          rightIcon={<ArrowRight />}
        />
      </Card>
      <AccountSummary account={props.account} change={change} />
    </div>
  )
}
