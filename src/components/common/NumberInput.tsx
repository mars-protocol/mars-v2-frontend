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
    if (props.isUSD || isEditing) return

    const newFormattedAmount = props.amount.isZero()
      ? ''
      : formatValue(props.amount.toNumber(), {
          decimals: props.asset.decimals,
          minDecimals: 0,
          maxDecimals: props.maxDecimals,
          thousandSeparator: false,
        })

    if (formattedAmount !== newFormattedAmount) {
      setFormattedAmount(newFormattedAmount)
    }
  }, [props.amount, props.asset, props.isUSD, props.maxDecimals, formattedAmount, isEditing])

  useEffect(() => {
    if (!onRef) return
    onRef(inputRef)
  }, [inputRef, onRef])

  const onInputFocus = () => {
    inputRef.current?.select()
    props.onFocus && props.onFocus()
  }

  const updateValues = (formatted: string, amount: BigNumber) => {
    const lastChar = formatted.charAt(formatted.length - 1)
    if (lastChar === '.') {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
    } else {
      cursorRef.current = inputRef.current?.selectionEnd || 0
    }
    setFormattedAmount(formatted)

    if (!props.amount.isEqualTo(amount)) {
      props.onChange(amount)
    }
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

  const onInputChange = (formattedAmount: string) => {
    const numberCount = formattedAmount.match(/[0-9]/g)?.length || 0
    const decimals = formattedAmount.split('.')[1]?.length || 0
    const lastChar = formattedAmount.charAt(formattedAmount.length - 1)
    const isNumber = !isNaN(Number(formattedAmount))
    const hasMultipleDots = (formattedAmount.match(/[.,]/g)?.length || 0) > 1
    const isSeparator = lastChar === '.' || lastChar === ','
    const isNegative = formattedAmount.indexOf('-') > -1
    const isLowerThanMinimum =
      props.min !== undefined && props.min.isGreaterThan(magnify(formattedAmount, props.asset))
    const isHigherThanMaximum =
      props.max !== undefined && props.max.isLessThan(magnify(formattedAmount, props.asset))
    const isTooLong = props.maxLength !== undefined && numberCount > props.maxLength
    const exceedsMaxDecimals = props.maxDecimals !== undefined && decimals > props.maxDecimals

    if (formattedAmount === '') {
      updateValues('0', BN_ZERO)
      return
    }

    if (isNegative && !props.allowNegative) return

    if (isSeparator && formattedAmount.length === 1) {
      updateValues('0.', BN_ZERO)
      return
    }

    if (isSeparator && !hasMultipleDots) {
      updateValues(formattedAmount.replace(',', '.'), props.amount)
      return
    }

    if (!isNumber || hasMultipleDots) return

    if (exceedsMaxDecimals) {
      formattedAmount = formattedAmount.substring(0, formattedAmount.length - 1)
    }

    if (isTooLong) return

    if (isLowerThanMinimum && props.min) {
      updateValues(String(demagnify(props.min, props.asset)), props.min)
      return
    }

    if (isHigherThanMaximum && props.max) {
      updateValues(String(demagnify(props.max, props.asset)), props.max)
      return
    }

    const amount = BN(formattedAmount).shiftedBy(props.asset.decimals)

    if (lastChar === '0' && amount.isEqualTo(props.amount)) {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
      setFormattedAmount(formattedAmount)
      return
    }

    updateValues(amount.shiftedBy(-1 * props.asset.decimals).toString(), amount)
  }

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