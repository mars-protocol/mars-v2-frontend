import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { BN } from 'utils/helpers'
import Slider from 'components/Slider'
import TokenInput from 'components/TokenInput'

interface Props {
  amount: BigNumber
  max: BigNumber
  asset: Asset
  onChange: (amount: BigNumber) => void
  className?: string
  disabled?: boolean
}

export default function TokenInputWithSlider(props: Props) {
  const [amount, setAmount] = useState(props.amount)
  const [percentage, setPercentage] = useState(0)

  const onSliderChange = useCallback(
    (percentage: number, liquidityAmount: BigNumber) => {
      const newAmount = BN(percentage).div(100).times(liquidityAmount)
      setPercentage(percentage)
      setAmount(newAmount)
      props.onChange(newAmount)
    },
    [props],
  )

  const onInputChange = useCallback(
    (newAmount: BigNumber, liquidityAmount: BigNumber) => {
      setAmount(newAmount)
      setPercentage(BN(newAmount).div(liquidityAmount).times(100).toNumber())
      props.onChange(newAmount)
    },
    [props],
  )

  console.log(percentage)
  return (
    <div className={props.className}>
      <TokenInput
        asset={props.asset}
        onChange={(amount) => onInputChange(amount, props.max)}
        amount={amount}
        max={props.max}
        className='mb-4'
        disabled={props.disabled}
      />
      <Slider
        value={percentage}
        onChange={(value) => onSliderChange(value, props.max)}
        disabled={props.disabled}
      />
    </div>
  )
}
