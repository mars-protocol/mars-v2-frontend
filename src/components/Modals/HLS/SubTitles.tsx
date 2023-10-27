import React from 'react'

import Text from 'components/Text'
import { formatAmountWithSymbol, formatValue } from 'utils/formatters'

interface SubTitleProps {
  text: string
}

export function SubTitle(props: SubTitleProps) {
  return (
    <Text className='text-white/60 mt-1' size='xs'>
      {props.text}
    </Text>
  )
}

interface CollateralSubTitleProps {
  amount: BigNumber
  denom: string
  isOpen: boolean
}

export function CollateralSubTitle(props: CollateralSubTitleProps) {
  if (props.isOpen || props.amount.isZero()) return null

  return (
    <SubTitle
      text={formatAmountWithSymbol({
        denom: props.denom,
        amount: props.amount.toString(),
      })}
    />
  )
}

interface LeveragedSubTitleProps {
  isOpen: boolean
  leverage: number
  positionValue: BigNumber
}
export function LeverageSubTitle(props: LeveragedSubTitleProps) {
  if (props.isOpen || props.leverage <= 1) return null

  return (
    <SubTitle
      text={`${props.leverage}x • Total Position Value ${formatValue(
        props.positionValue.toString(),
        { prefix: '$', abbreviated: true },
      )}`}
    />
  )
}
