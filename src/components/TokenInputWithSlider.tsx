'use client'

import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import Slider from 'components/Slider'
import TokenInput from 'components/TokenInput'
import { ASSETS } from 'constants/assets'
import { BN } from 'utils/helpers'

interface Props {
  amount: BigNumber
  onChange: (amount: BigNumber) => void
  className?: string
  disabled?: boolean
  balances?: Coin[] | null
  accountId?: string
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
    (percentage: number) => {
      const newAmount = BN(percentage).div(100).times(max)
      setPercentage(percentage)
      setAmount(newAmount)
      props.onChange(newAmount)
    },
    [props, max],
  )

  const onInputChange = useCallback(
    (newAmount: BigNumber) => {
      setAmount(newAmount)
      setPercentage(BN(newAmount).div(max).times(100).toNumber())
      props.onChange(newAmount)
    },
    [props, max],
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

  useEffect(() => {
    if (props.max?.isEqualTo(max)) return
    setMax(props.max ? props.max : BN(0))
    setPercentage(0)
    setAmount(BN(0))
    setAsset(props.asset ? props.asset : ASSETS[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.max, props.asset])

  return (
    <div className={props.className}>
      <TokenInput
        asset={asset}
        onChange={(amount) => onInputChange(amount)}
        onChangeAsset={(asset: Asset, max: BigNumber) => onAssetChange(asset, max)}
        amount={amount}
        max={max}
        className='mb-4'
        disabled={props.disabled}
        hasSelect={props.hasSelect}
        balances={props.balances}
        accountId={props.accountId}
      />
      <Slider
        value={percentage}
        onChange={(value) => onSliderChange(value)}
        disabled={props.disabled}
      />
    </div>
  )
}
