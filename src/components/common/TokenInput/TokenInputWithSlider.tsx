import { useEffect, useMemo, useState } from 'react'

import Slider from 'components/common/Slider'
import TokenInput from 'components/common/TokenInput/index'
import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/chain/useChainConfig'
import { BNCoin } from 'types/classes/BNCoin'
import { deductFeeFromMax, getCurrentFeeToken } from 'utils/feeToken'
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
  deductFee?: boolean
}

export default function TokenInputWithSlider(props: Props) {
  const [amount, setAmount] = useState(props.amount)
  const [percentage, setPercentage] = useState(0)
  const chainConfig = useChainConfig()

  const currentFeeToken = getCurrentFeeToken(chainConfig)
  const isCurrentFeeToken = currentFeeToken?.coinMinimalDenom === props.asset.denom

  const adjustedMax = useMemo(() => {
    if (props.deductFee === true && isCurrentFeeToken) {
      return deductFeeFromMax(props.max, props.asset.denom, props.asset.decimals, chainConfig)
    }
    return props.max
  }, [
    props.max,
    props.asset.denom,
    props.asset.decimals,
    isCurrentFeeToken,
    props.deductFee,
    chainConfig,
  ])

  function onChangeSlider(percentage: number) {
    const newAmount = BN(percentage).dividedBy(100).multipliedBy(adjustedMax).integerValue()
    onChangeAmount(newAmount)
  }

  function onChangeAmount(newAmount: BigNumber) {
    setAmount(newAmount)
    setPercentage(BN(newAmount).dividedBy(adjustedMax).multipliedBy(100).toNumber())
    props.onChange(newAmount)
  }

  function onChangeAsset(newAsset: Asset) {
    if (!props.onChangeAsset) return
    setPercentage(0)
    setAmount(BN_ZERO)
    props.onChangeAsset(newAsset)
  }

  useEffect(() => {
    const newAmount = props.amount.isLessThan(adjustedMax) ? props.amount : adjustedMax
    const newPercentage = newAmount.dividedBy(adjustedMax).multipliedBy(100).toNumber()
    if (!amount.isEqualTo(newAmount)) setAmount(newAmount)
    if (percentage !== newPercentage) setPercentage(newPercentage)
  }, [adjustedMax, props.amount, amount, percentage])

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
        deductFee={props.deductFee}
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
