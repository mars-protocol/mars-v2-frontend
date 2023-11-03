import React from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChangeAmount: (amount: BigNumber) => void
  onClickBtn: () => void
}

export default function ProvideCollateral(props: Props) {
  return (
    <div className='p-4 flex-col gap-6 flex'>
      <TokenInputWithSlider
        maxText='In wallet'
        amount={props.amount}
        asset={props.asset}
        max={props.max}
        onChange={props.onChangeAmount}
      />
      <Button onClick={props.onClickBtn} text='Continue' rightIcon={<ArrowRight />} />
    </div>
  )
}
