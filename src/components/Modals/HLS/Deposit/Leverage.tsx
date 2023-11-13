import React from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import LeverageSummary from 'components/Modals/HLS/Deposit/LeverageSummary'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChangeAmount: (amount: BigNumber) => void
  onClickBtn: () => void
  positionValue: BigNumber
  leverage: number
  maxLeverage: number
}

export default function Leverage(props: Props) {
  return (
    <div className='flex-col gap-6 flex justify-between h-full p-4'>
      <TokenInputWithSlider
        amount={props.amount}
        asset={props.asset}
        max={props.max}
        onChange={props.onChangeAmount}
        maxText='Max borrow'
        leverage={{
          current: props.leverage,
          max: props.maxLeverage,
        }}
      />
      <div className='flex flex-col gap-6'>
        <LeverageSummary asset={props.asset} positionValue={props.positionValue} />
        <Button onClick={props.onClickBtn} text='Continue' rightIcon={<ArrowRight />} />
      </div>
    </div>
  )
}
