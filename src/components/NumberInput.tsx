'use client'

import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset
  amount: BigNumber
  min?: BigNumber
  max?: BigNumber
  className: string
  maxDecimals: number
  maxLength?: number
  allowNegative?: boolean
  style?: {}
  disabled?: boolean
  onChange: (amount: BigNumber) => void
  onBlur?: () => void
  onFocus?: () => void
  onRef?: (ref: React.RefObject<HTMLInputElement>) => void
}

export default function NumberInput(props: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorRef = React.useRef(0)
  // const max = props.max ? demagnify(props.max, props.asset) : undefined

  const [formattedAmount, setFormattedAmount] = useState(
    props.amount.shiftedBy(-1 * props.asset.decimals).toString(),
  )

  useEffect(() => {
    setFormattedAmount(
      formatValue(props.amount.toNumber(), {
        decimals: props.asset.decimals,
        maxDecimals: props.asset.decimals,
        thousandSeparator: false,
      }),
    )
  }, [props.amount, props.asset])

  useEffect(() => {
    if (!props.onRef) return
    props.onRef(inputRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef, props.onRef])

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
    console.log(props.amount.toNumber(), amount.toNumber())
    if (props.amount.isEqualTo(amount)) {
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
    const isLowerThanMinimum = props.min !== undefined && props.min.isGreaterThan(formattedAmount)
    const isHigherThanMaximum = props.max !== undefined && props.max.isLessThan(formattedAmount)
    const isTooLong = props.maxLength !== undefined && numberCount > props.maxLength
    const exceedsMaxDecimals = props.maxDecimals !== undefined && decimals > props.maxDecimals

    if (isNegative && !props.allowNegative) return

    if (isSeparator && formattedAmount.length === 1) {
      updateValues('0.', BN(0))
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
      updateValues(String(props.min), props.min)
      return
    }

    if (isHigherThanMaximum && props.max) {
      updateValues(String(props.max), props.max)
      return
    }

    const amount = BN(formattedAmount).shiftedBy(props.asset.decimals)

    if (lastChar === '0' && amount.isEqualTo(props.amount)) {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
      setFormattedAmount(formattedAmount)
      return
    }

    if (!formattedAmount) {
      updateValues(formattedAmount, BN(0))
      return
    }

    updateValues(formattedAmount, amount)
  }

  return (
    <input
      ref={inputRef}
      type='text'
      value={formattedAmount === '0' ? '' : formattedAmount}
      onFocus={onInputFocus}
      onChange={(e) => onInputChange(e.target.value)}
      onBlur={props.onBlur}
      disabled={props.disabled}
      className={classNames(
        'w-full cursor-pointer appearance-none border-none bg-transparent text-right outline-none',
        props.className,
      )}
      style={props.style}
    />
  )
}
