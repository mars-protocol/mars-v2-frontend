import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import { demagnify, formatValue, magnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset | PseudoAsset
  amount: BigNumber
  min?: BigNumber
  max?: BigNumber
  className: string
  maxDecimals: number
  maxLength?: number
  allowNegative?: boolean
  style?: {}
  disabled?: boolean
  placeholder?: string
  onChange: (amount: BigNumber) => void
  onBlur?: () => void
  onFocus?: () => void
  onRef?: (ref: React.RefObject<HTMLInputElement>) => void
  isUSD?: boolean
}

export default function NumberInput(props: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorRef = React.useRef(0)
  const { onRef } = props

  const [formattedAmount, setFormattedAmount] = useState(
    props.amount.shiftedBy(-1 * props.asset.decimals).toString(),
  )

  useEffect(() => {
    if (props.amount.isZero() && formattedAmount !== '0.' && formattedAmount !== '.') {
      setFormattedAmount('')
      return
    }
    if (props.isUSD) return

    const newFormattedAmount = formatValue(props.amount.toNumber(), {
      decimals: props.asset.decimals,
      minDecimals: 0,
      maxDecimals: props.maxDecimals,
      thousandSeparator: false,
    })

    if (!formattedAmount.endsWith('.') && formattedAmount !== newFormattedAmount) {
      setFormattedAmount(newFormattedAmount)
    }
  }, [props.amount, props.asset, props.isUSD, props.maxDecimals, formattedAmount])

  useEffect(() => {
    if (!onRef) return
    onRef(inputRef)
  }, [inputRef, onRef])

  const onInputFocus = () => {
    inputRef.current?.select()
    props.onFocus && props.onFocus()
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    let cursorPosition = e.target.selectionStart || 0

    if (newValue === '.' && formattedAmount === '') {
      newValue = '0.'
      cursorPosition = 2
    }

    setFormattedAmount(newValue)

    const floatValue = Number.isNaN(Number(newValue.replace(',', '.')))
      ? undefined
      : Number(newValue.replace(',', '.'))

    if (floatValue !== undefined) {
      const newAmount = BN(floatValue).shiftedBy(props.asset.decimals)

      if (!newAmount.isEqualTo(props.amount)) {
        props.onChange(newAmount)
      }
    } else if (newValue === '' || newValue === '0.') {
      props.onChange(BN_ZERO)
    }

    cursorRef.current = cursorPosition
  }

  const onInputBlur = () => {
    if (formattedAmount.endsWith('.')) {
      const newValue = formattedAmount.slice(0, -1)
      setFormattedAmount(newValue)
      props.onChange(BN(newValue).shiftedBy(props.asset.decimals))
    }
    props.onBlur && props.onBlur()
  }

  useEffect(() => {
    if (!inputRef.current) return

    const cursor = cursorRef.current
    const length = formattedAmount.length

    if (cursor > length) {
      inputRef.current.setSelectionRange(length, length)
      return
    }

    inputRef.current.setSelectionRange(cursor, cursor)
  }, [formattedAmount, inputRef])

  return (
    <input
      ref={inputRef}
      type='text'
      value={formattedAmount}
      onFocus={onInputFocus}
      onChange={onInputChange}
      onBlur={props.onBlur ?? onInputBlur}
      disabled={props.disabled}
      className={classNames(
        'w-full hover:cursor-pointer appearance-none border-none bg-transparent text-right outline-none',
        props.disabled && 'pointer-events-none',
        props.className,
      )}
      style={props.style}
      placeholder={props.placeholder ?? '0'}
    />
  )
}
