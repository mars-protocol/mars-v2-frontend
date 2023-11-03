import React from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import LeverageSummary from 'components/Modals/HLS/LeverageSummary'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChangeAmount: (amount: BigNumber) => void
  onClickBtn: () => void
  positionValue: BigNumber
}

export default function Leverage(props: Props) {
  return (
    <div className='p-4 flex-col gap-6 flex'>
      <TokenInputWithSlider
        amount={props.amount}
        asset={props.asset}
        max={props.max}
        onChange={props.onChangeAmount}
        maxText='Max borrow'
      />
      <LeverageSummary asset={props.asset} positionValue={props.positionValue} />
      <Button onClick={props.onClickBtn} text='Continue' rightIcon={<ArrowRight />} />
    </div>
  )
}
