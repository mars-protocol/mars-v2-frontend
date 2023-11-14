import classNames from 'classnames'
import React from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { ExclamationMarkTriangle } from 'components/Icons'
import Text from 'components/Text'
import WarningMessages from 'components/WarningMessages'
import { BNCoin } from 'types/classes/BNCoin'
import { formatAmountWithSymbol, formatLeverage } from 'utils/formatters'

interface SubTitleProps {
  text: string
  color?: string
}

export function SubTitle(props: SubTitleProps) {
  return (
    <Text
      className={classNames(props.color ? props.color : 'text-white/60', 'mt-1')}
      size='xs'
      tag='span'
    >
      {props.text}
    </Text>
  )
}

interface CollateralSubTitleProps {
  amount: BigNumber
  denom: string
  isOpen: boolean
  warningMessages: string[]
}

export function CollateralSubTitle(props: CollateralSubTitleProps) {
  if (props.isOpen) return null

  if (!props.isOpen && props.amount.isZero()) {
    return (
      <div className='flex gap-2'>
        <ExclamationMarkTriangle width={24} className='text-warning' />
        <Text className='text-warning mt-1' size='xs' tag='span'>
          You have not provided any collateral.
        </Text>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-1'>
      <WarningMessages messages={props.warningMessages} />
      <SubTitle
        text={formatAmountWithSymbol({
          denom: props.denom,
          amount: props.amount.toString(),
        })}
        color={props.warningMessages.length > 0 ? 'text-warning' : ''}
      />
    </div>
  )
}

interface LeveragedSubTitleProps {
  isOpen: boolean
  leverage: number
  positionValue: BigNumber
  warningMessages: string[]
}
export function LeverageSubTitle(props: LeveragedSubTitleProps) {
  if (props.isOpen || props.leverage <= 1) return null

  return (
    <div className='flex items-center gap-1'>
      <WarningMessages messages={props.warningMessages} />
      <SubTitle
        text={`${formatLeverage(props.leverage)} • Total Position Value `}
        color={props.warningMessages.length > 0 ? 'text-warning' : ''}
      />
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber('usd', props.positionValue)}
        className={classNames(
          'text-xs inline mt-1',
          props.warningMessages.length ? 'text-warning' : 'text-white/60',
        )}
      />
    </div>
  )
}

interface SelectAccountSubTitleProps {
  isOpen: boolean
  isSummaryOpen: boolean
  selectedAccountId?: string
  type: 'create' | 'select'
}

export function SelectAccountSubTitle(props: SelectAccountSubTitleProps) {
  if (!props.isOpen && props.selectedAccountId) {
    return (
      <Text className='mt-1 text-white/60' size='xs' tag='span'>
        Account {props.selectedAccountId}
      </Text>
    )
  }

  if (!props.selectedAccountId && props.isSummaryOpen) {
    return (
      <div className='flex gap-2'>
        <ExclamationMarkTriangle width={24} className='text-warning' />
        <Text className='text-warning mt-1' size='xs' tag='span'>
          You need to {props.type} an account
        </Text>
      </div>
    )
  }

  return ''
}
