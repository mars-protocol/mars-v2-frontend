import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Slider from 'components/Slider'
import TokenInput from 'components/TokenInput'
import { BN } from 'utils/helpers'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChange: (amount: BigNumber) => void
  accountId?: string
  balances?: Coin[]
  className?: string
  disabled?: boolean
  hasSelect?: boolean
  maxText?: string
  onChangeAsset?: (asset: Asset) => void
}

export default function TokenInputWithSlider(props: Props) {
  const [amount, setAmount] = useState(props.amount)
  const [percentage, setPercentage] = useState(0)

  function onChangeSlider(percentage: number) {
    const newAmount = BN(percentage).div(100).times(props.max)
    setPercentage(percentage)
    setAmount(newAmount)
    props.onChange(newAmount)
  }

  function onChangeAmount(newAmount: BigNumber) {
    setAmount(newAmount)
    setPercentage(BN(newAmount).div(props.max).times(100).toNumber())
    props.onChange(newAmount)
  }

  function onChangeAsset(newAsset: Asset) {
    if (!props.onChangeAsset) return
    setPercentage(0)
    setAmount(BN(0))
    props.onChangeAsset(newAsset)
  }

  return (
    <div className={props.className}>
      <TokenInput
        asset={props.asset}
        onChange={onChangeAmount}
        onChangeAsset={onChangeAsset}
        amount={amount}
        className='mb-4'
        max={props.max}
        maxText={props.maxText}
        disabled={props.disabled}
        hasSelect={props.hasSelect}
        balances={props.balances}
        accountId={props.accountId}
      />
      <Slider
        value={percentage}
        onChange={(value) => onChangeSlider(value)}
        disabled={props.disabled}
      />
    </div>
  )
}
