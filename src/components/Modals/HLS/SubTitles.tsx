import React from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import Text from 'components/Text'
import { BNCoin } from 'types/classes/BNCoin'
import { formatAmountWithSymbol, formatLeverage } from 'utils/formatters'

interface SubTitleProps {
  text: string
}

export function SubTitle(props: SubTitleProps) {
  return (
    <Text className='text-white/60 mt-1' size='xs' tag='span'>
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
    <>
      <SubTitle text={`${formatLeverage(props.leverage)} • Total Position Value `} />
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber('usd', props.positionValue)}
        className='text-white/60 text-xs inline'
      />
    </>
  )
}
