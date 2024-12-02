import { useCallback, useEffect, useState } from 'react'
import NumberInput from 'components/common/NumberInput'
import { BNCoin } from 'types/classes/BNCoin'
import DisplayCurrency from 'components/common/DisplayCurrency'
import classNames from 'classnames'
import { BN_ZERO } from 'constants/math'
import { getPerpsPriceDecimals } from 'utils/formatters'

interface Props {
  label?: string
  amount: BigNumber
  asset: Asset
  disabled?: boolean
  setAmount: (amount: BigNumber) => void
  containerClassName?: string
  onFocus?: () => void
  onBlur?: () => void
}

export default function LimitPriceInput(props: Props) {
  const { label, amount, asset, disabled, setAmount, containerClassName, onFocus, onBlur } = props

  const [inputValue, setInputValue] = useState(amount)

  const handleChange = useCallback(
    (value: BigNumber) => {
      const newValue = value.isNegative() ? BN_ZERO : value
      setInputValue(newValue)
      setAmount(newValue)
    },
    [setAmount],
  )

  useEffect(() => {
    setInputValue(amount)
  }, [amount])

  return (
    <div className={containerClassName}>
      <label>
        {label}
        <div
          className={classNames(
            'flex flex-1 flex-row py-3 border border-white/20 rounded bg-white/5 pl-3 pr-2 mt-2',
            disabled && 'opacity-50',
          )}
        >
          <NumberInput
            asset={{ ...asset, decimals: 0 }}
            amount={inputValue}
            className='border-none bg-transparent outline-none flex-1 !text-left'
            maxDecimals={18}
            disabled={disabled}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <span>USD</span>
        </div>
        <div className='mt-2 text-xs text-white text-opacity-60'>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber('usd', inputValue)}
            showDetailedPrice
          />
        </div>
      </label>
    </div>
  )
}
