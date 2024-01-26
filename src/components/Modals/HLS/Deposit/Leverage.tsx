import React, { useMemo } from 'react'

import Button from 'components/common/Button'
import { ArrowRight } from 'components/common/Icons'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import LeverageSummary from 'components/Modals/HLS/Deposit/LeverageSummary'
import { getLeveragedApy } from 'utils/math'

interface Props {
  amount: BigNumber
  borrowMarket: Market
  max: BigNumber
  onChangeAmount: (amount: BigNumber) => void
  onClickBtn: () => void
  positionValue: BigNumber
  leverage: number
  maxLeverage: number
  baseApy: number
  warningMessages: string[]
}

export default function Leverage(props: Props) {
  const apy = useMemo(() => {
    if (!props.borrowMarket.apy.borrow) return 0
    return getLeveragedApy(props.baseApy, props.borrowMarket.apy.borrow, props.leverage)
  }, [props.baseApy, props.borrowMarket.apy.borrow, props.leverage])

  return (
    <div id='item-1' className='flex-col gap-6 flex justify-between h-full p-4'>
      <TokenInputWithSlider
        amount={props.amount}
        asset={props.borrowMarket.asset}
        max={props.max}
        onChange={props.onChangeAmount}
        maxText='Max borrow'
        leverage={{
          current: props.leverage,
          max: props.maxLeverage,
        }}
        warningMessages={props.warningMessages}
      />
      <div className='flex flex-col gap-6'>
        <LeverageSummary
          asset={props.borrowMarket.asset}
          positionValue={props.positionValue}
          apy={apy}
        />
        <Button onClick={props.onClickBtn} text='Continue' rightIcon={<ArrowRight />} />
      </div>
    </div>
  )
}
