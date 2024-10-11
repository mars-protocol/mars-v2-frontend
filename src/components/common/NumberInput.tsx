import classNames from 'classnames'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const cursorRef = useRef(0)
  const { onRef } = props

  const [formattedAmount, setFormattedAmount] = useState(
    props.amount.isZero() ? '' : props.amount.shiftedBy(-1 * props.asset.decimals).toString(),
  )

  const [isEditing, setIsEditing] = useState(false)

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

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    let cursorPosition = e.target.selectionStart || 0

    if (newValue === '.' && formattedAmount === '') {
      newValue = '0.'
      cursorPosition = 2
      setFormattedAmount(newValue)
      setIsEditing(true)
      props.onChange(BN_ZERO)
      cursorRef.current = cursorPosition
      return
    }

    if (/^\d*\.?\d*$/.test(newValue)) {
      let newAmount = BN(newValue || '0')

      if (props.max && newAmount.isGreaterThan(props.max.shiftedBy(-props.asset.decimals))) {
        newAmount = props.max.shiftedBy(-props.asset.decimals)
        newValue = newAmount.toString()
        cursorPosition = newValue.length
      }

      setIsEditing(true)
      setFormattedAmount(newValue)
      cursorRef.current = cursorPosition

      if (newValue === '') {
        props.onChange(BN_ZERO)
      } else if (newValue === '.') {
        setFormattedAmount('0.')
        props.onChange(BN_ZERO)
      } else {
        const shiftedAmount = newAmount.shiftedBy(props.asset.decimals)
        props.onChange(shiftedAmount)
      }
    } else {
      cursorRef.current = cursorPosition
    }
  }

  const onInputBlur = () => {
    setIsEditing(false)
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