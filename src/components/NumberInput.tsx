'use client'

import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

interface Props {
  value: string
  className: string
  maxDecimals: number
  minValue?: number
  max?: number
  maxLength?: number
  allowNegative?: boolean
  style?: {}
  onChange: (value: number) => void
  onBlur?: () => void
  onFocus?: () => void
  onRef?: (ref: React.RefObject<HTMLInputElement>) => void
}

export default function NumberInput(props: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorRef = React.useRef(0)
  const [inputValue, setInputValue] = useState({
    formatted: props.value,
    value: Number(props.value),
  })

  useEffect(() => {
    setInputValue({
      formatted: props.value,
      value: Number(props.value),
    })
  }, [props.value])

  useEffect(() => {
    if (!props.onRef) return
    props.onRef(inputRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef, props.onRef])

  const onInputFocus = () => {
    inputRef.current?.select()
    props.onFocus && props.onFocus()
  }

  const updateValues = (formatted: string, value: number) => {
    const lastChar = formatted.charAt(formatted.length - 1)
    if (lastChar === '.') {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
    } else {
      cursorRef.current = inputRef.current?.selectionEnd || 0
    }
    setInputValue({ formatted, value })
    if (value !== inputValue.value) {
      props.onChange(value)
    }
  }

  useEffect(() => {
    if (!inputRef.current) return

    const cursor = cursorRef.current
    const length = inputValue.formatted.length

    if (cursor > length) {
      inputRef.current.setSelectionRange(length, length)
      return
    }

    inputRef.current.setSelectionRange(cursor, cursor)
  }, [inputValue, inputRef])

  const onInputChange = (value: string) => {
    const numberCount = value.match(/[0-9]/g)?.length || 0
    const decimals = value.split('.')[1]?.length || 0
    const lastChar = value.charAt(value.length - 1)
    const isNumber = !isNaN(Number(value))
    const hasMultipleDots = (value.match(/[.,]/g)?.length || 0) > 1
    const isSeparator = lastChar === '.' || lastChar === ','
    const isNegative = value.indexOf('-') > -1
    const isLowerThanMinimum = props.minValue !== undefined && Number(value) < props.minValue
    const isHigherThanMaximum = props.max !== undefined && Number(value) > props.max
    const isTooLong = props.maxLength !== undefined && numberCount > props.maxLength
    const exceedsMaxDecimals = props.maxDecimals !== undefined && decimals > props.maxDecimals

    if (isNegative && !props.allowNegative) return

    if (isSeparator && value.length === 1) {
      updateValues('0.', 0)
      return
    }

    if (isSeparator && !hasMultipleDots) {
      updateValues(value.replace(',', '.'), inputValue.value)
      return
    }

    if (!isNumber || hasMultipleDots) return

    if (exceedsMaxDecimals) {
      value = value.substring(0, value.length - 1)
    }

    if (isTooLong) return

    if (isLowerThanMinimum) {
      updateValues(String(props.minValue), props.minValue!)
      return
    }

    if (isHigherThanMaximum) {
      updateValues(String(props.max), props.max!)
      return
    }

    if (lastChar === '0' && Number(value) === Number(inputValue.value)) {
      cursorRef.current = (inputRef.current?.selectionEnd || 0) + 1
      setInputValue({ ...inputValue, formatted: value })
      return
    }

    if (!value) {
      updateValues(value, 0)
      return
    }

    updateValues(String(Number(value)), Number(value))
  }

  return (
    <input
      ref={inputRef}
      type='text'
      value={inputValue.formatted === '0' ? '' : inputValue.formatted}
      onFocus={onInputFocus}
      onChange={(e) => onInputChange(e.target.value)}
      onBlur={props.onBlur}
      className={classNames(
        'w-full cursor-pointer appearance-none border-none bg-transparent text-right outline-none',
        props.className,
      )}
      style={props.style}
    />
  )
}
