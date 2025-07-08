import classNames from 'classnames'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import { formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset | PseudoAsset
  amount: BigNumber
  max?: BigNumber
  className: string
  maxDecimals: number
  style?: {}
  disabled?: boolean
  placeholder?: string
  onChange: (amount: BigNumber) => void
  onBlur?: () => void
  onFocus?: () => void
  onRef?: (ref: React.RefObject<HTMLInputElement | null>) => void
}

export default function NumberInput({
  asset,
  amount,
  max,
  className,
  maxDecimals,
  style,
  disabled,
  placeholder,
  onChange,
  onBlur,
  onFocus,
  onRef,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const cursorRef = useRef(0)

  const [formattedAmount, setFormattedAmount] = useState(() => {
    if (amount.isZero()) {
      return ''
    }
    return formatValue(amount.toNumber(), {
      decimals: asset.decimals,
      minDecimals: 0,
      maxDecimals: maxDecimals,
      thousandSeparator: false,
    })
  })

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isEditing) return

    const newFormattedAmount = amount.isZero()
      ? ''
      : formatValue(amount.toNumber(), {
          decimals: asset.decimals,
          minDecimals: 0,
          maxDecimals: maxDecimals,
          thousandSeparator: false,
        })

    if (formattedAmount !== newFormattedAmount) {
      setFormattedAmount(newFormattedAmount)
    }
  }, [amount, asset, maxDecimals, formattedAmount, isEditing])

  useEffect(() => {
    if (!onRef) return
    onRef(inputRef)
  }, [inputRef, onRef])

  const onInputFocus = () => {
    inputRef.current?.select()
    onFocus?.()
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    let cursorPosition = e.target.selectionStart ?? 0

    if (newValue === '.' && formattedAmount === '') {
      newValue = '0.'
      cursorPosition = 2
      setFormattedAmount(newValue)
      setIsEditing(true)
      onChange(BN_ZERO)
      cursorRef.current = cursorPosition
      return
    }

    const decimalPattern = maxDecimals > 0 ? `^\\d*\\.?\\d{0,${maxDecimals}}$` : '^\\d*$'
    const regex = new RegExp(decimalPattern)

    if (regex.test(newValue)) {
      let newAmount = BN(newValue || '0')

      if (max && newAmount.isGreaterThan(max.shiftedBy(-asset.decimals))) {
        newAmount = max.shiftedBy(-asset.decimals)
        newValue = newAmount.toString()
        cursorPosition = newValue.length
      }

      setIsEditing(true)
      setFormattedAmount(newValue)
      cursorRef.current = cursorPosition

      if (newValue === '') {
        onChange(BN_ZERO)
      } else if (newValue === '.') {
        setFormattedAmount('0.')
        onChange(BN_ZERO)
      } else {
        const shiftedAmount = newAmount.shiftedBy(asset.decimals)
        onChange(shiftedAmount)
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
      onChange(BN(newValue).shiftedBy(asset.decimals))
    }
    onBlur?.()
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
      onBlur={onBlur ?? onInputBlur}
      disabled={disabled}
      className={classNames(
        'w-full hover:cursor-pointer appearance-none border-none bg-transparent text-right outline-none',
        disabled && 'pointer-events-none',
        className,
      )}
      style={style}
      placeholder={placeholder ?? '0'}
    />
  )
}
