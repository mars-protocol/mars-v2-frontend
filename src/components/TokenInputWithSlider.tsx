import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { BN } from 'utils/helpers'
import Slider from 'components/Slider'
import TokenInput from 'components/TokenInput'
import { ASSETS } from 'constants/assets'

interface Props {
  amount: BigNumber
  onChange: (amount: BigNumber) => void
  className?: string
  disabled?: boolean
}

interface SingleProps extends Props {
  max: BigNumber
  asset: Asset
  hasSelect?: boolean
  onChangeAsset?: (asset: Asset) => void
}

interface SelectProps extends Props {
  max?: BigNumber
  asset?: Asset
  onChangeAsset: (asset: Asset) => void
  hasSelect: boolean
}

export default function TokenInputWithSlider(props: SingleProps | SelectProps) {
  const [amount, setAmount] = useState(props.amount)
  const [percentage, setPercentage] = useState(0)
  const [asset, setAsset] = useState<Asset>(props.asset ? props.asset : ASSETS[0])
  const [max, setMax] = useState<BigNumber>(props.max ? props.max : BN(0))

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


  const onAssetChange = useCallback(
    (newAsset: Asset, liquidtyAmount: BigNumber) => {
      props.onChangeAsset && props.onChangeAsset(newAsset)
      setAsset(newAsset)
      setMax(liquidtyAmount)
      setPercentage(0)
      setAmount(BN(0))
    },
    [props],
  )

  return (
    <div className={props.className}>
      <TokenInput
        asset={asset}
        onChange={(amount) => onInputChange(amount, max)}
        onChangeAsset={(asset:Asset, max: BigNumber) => onAssetChange(asset, max)}
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
