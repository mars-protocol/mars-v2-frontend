import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import Slider from './Slider'
import TokenInput from './TokenInput'

interface Props {
  amount: number
  max: number
  asset: Asset
  onChange: (amount: number) => void
  className?: string
  disabled?: boolean
}

export default function TokenInputWithSlider(props: Props) {
  const [amount, setAmount] = useState(props.amount)
  const [percentage, setPercentage] = useState(0)

  const onSliderChange = useCallback(
    (percentage: number, liquidityAmount: number) => {
      const newAmount = new BigNumber(percentage).div(100).times(liquidityAmount).toNumber()
      setPercentage(percentage)
      setAmount(newAmount)
      props.onChange(newAmount)
    },
    [props],
  )

  const onInputChange = useCallback(
    (newAmount: number, liquidityAmount: number) => {
      setAmount(newAmount)
      setPercentage(new BigNumber(newAmount).div(liquidityAmount).times(100).toNumber())
      props.onChange(newAmount)
    },
    [props],
  )

  return (
    <>
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
        className='mb-4'
        disabled={props.disabled}
      />
    </>
  )
}
