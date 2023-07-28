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
import { hardcodedFee } from 'utils/constants'
import { BN_ZERO } from 'constants/math'

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
  const [amount, setAmount] = useState(BN_ZERO)
  const [change, setChange] = useState<AccountChange | undefined>()

  const max = props.isFunding
    ? getAmount(currentAsset.denom, balances ?? [])
    : props.account
    ? getAmount(currentAsset.denom, props.account.deposits)
    : BN_ZERO

  function onChangeAmount(val: BigNumber) {
    setAmount(val)
    setChange({
      deposits: [
        {
          amount: props.isFunding
            ? BN_ZERO.plus(amount).toString()
            : BN_ZERO.minus(amount).toString(),
          denom: currentAsset.denom,
        },
      ],
    })
  }

  function resetState() {
    setCurrentAsset(baseCurrency)
    setAmount(BN_ZERO)
    setChange(undefined)
  }

  async function onConfirm() {
    setIsConfirming(true)
    let result
    if (props.isFunding) {
      result = await deposit({
        fee: hardcodedFee,
        accountId: props.account.id,
        coins: [
          {
            denom: currentAsset.denom,
            amount: amount.toString(),
          },
        ],
      })
    } else {
      result = await withdraw({
        fee: hardcodedFee,
        accountId: props.account.id,
        coins: [
          {
            denom: currentAsset.denom,
            amount: amount.toString(),
          },
        ],
      })
    }

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ fundAndWithdrawModal: null })
    }
  }

  return (
    <div className='flex flex-1 items-start gap-6 p-6'>
      <Card
        className='flex flex-1 bg-white/5 p-4'
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
          disabled={isConfirming}
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
