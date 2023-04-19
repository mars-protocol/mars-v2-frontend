import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import Slider from 'components/Slider'
import TokenInput from 'components/TokenInput'
import { ASSETS } from 'constants/assets'

interface Props {
  amount: number
  onChange: (amount: number) => void
  className?: string
  disabled?: boolean
}

interface SingleProps extends Props {
  max: number
  asset: Asset
  hasSelect?: boolean
  onChangeAsset?: (asset: Asset) => void
}

interface SelectProps extends Props {
  max?: number
  asset?: Asset
  onChangeAsset: (asset: Asset) => void
  hasSelect: boolean
}

export default function TokenInputWithSlider(props: SingleProps | SelectProps) {
  const [amount, setAmount] = useState(props.amount)
  const [percentage, setPercentage] = useState(0)
  const [asset, setAsset] = useState<Asset>(props.asset ? props.asset : ASSETS[0])
  const [max, setMax] = useState<number>(props.max ? props.max : 0)

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

  const onAssetChange = useCallback(
    (newAsset: Asset, liquidtyAmount: number) => {
      props.onChangeAsset && props.onChangeAsset(newAsset)
      setAsset(newAsset)
      setMax(liquidtyAmount)
      setPercentage(0)
      setAmount(0)
    },
    [props],
  )

  return (
    <div className={props.className}>
      <TokenInput
        asset={asset}
        onChange={(amount) => onInputChange(amount, max)}
        onChangeAsset={(asset, max) => onAssetChange(asset, max)}
        amount={amount}
        max={max}
        className='mb-4'
        disabled={props.disabled}
        hasSelect
      />
      <Slider
        value={percentage}
        onChange={(value) => onSliderChange(value, max)}
        disabled={props.disabled}
      />
    </div>
  )
}
