import { useEffect, useState } from 'react'

import Slider from 'components/common/Slider'
import TokenInput from 'components/common/TokenInput/index'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChange: (amount: BigNumber) => void
  onDebounce?: () => void
  accountId?: string
  balances?: BNCoin[]
  className?: string
  disabled?: boolean
  hasSelect?: boolean
  maxText?: string
  onChangeAsset?: (asset: Asset) => void
  leverage?: {
    current: number
    max: number
    min?: number
  }
  warningMessages: string[]
  chainName?: string
}

export default function TokenInputWithSlider(props: Props) {
  const [amount, setAmount] = useState(props.amount)
  const [percentage, setPercentage] = useState(0)

  function onChangeSlider(percentage: number) {
    const newAmount = BN(percentage).dividedBy(100).multipliedBy(props.max).integerValue()
    onChangeAmount(newAmount)
  }

  function onChangeAmount(newAmount: BigNumber) {
    setAmount(newAmount)
    setPercentage(BN(newAmount).dividedBy(props.max).multipliedBy(100).toNumber())
    props.onChange(newAmount)
  }

  function onChangeAsset(newAsset: Asset) {
    if (!props.onChangeAsset) return
    setPercentage(0)
    setAmount(BN_ZERO)
    props.onChangeAsset(newAsset)
  }

  useEffect(() => {
    const newAmount = props.amount.isLessThan(props.max) ? props.amount : props.max
    const newPercentage = newAmount.dividedBy(props.max).multipliedBy(100).toNumber()
    if (!amount.isEqualTo(newAmount)) setAmount(newAmount)
    if (percentage !== newPercentage) setPercentage(newPercentage)
  }, [props.max, props.amount, amount, percentage])

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
        warningMessages={props.warningMessages}
        chainName={props.chainName}
      />
      <Slider
        value={percentage || 0}
        onChange={(value) => onChangeSlider(value)}
        disabled={props.disabled}
        leverage={props.leverage}
      />
    </div>
  )
}
