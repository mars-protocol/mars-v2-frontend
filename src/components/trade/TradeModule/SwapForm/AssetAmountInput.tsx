import { useCallback, useEffect, useMemo, useState } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import NumberInput from 'components/common/NumberInput'
import { BNCoin } from 'types/classes/BNCoin'
import { BN_ZERO } from 'constants/math'

interface Props {
  label?: string
  max: BigNumber
  asset: Asset
  amount: BigNumber
  disabled: boolean
  maxButtonLabel: string
  amountValueText?: string
  containerClassName?: string
  setAmount: (amount: BigNumber) => void
  onFocus?: () => void
  onBlur?: () => void
}

export default function AssetAmountInput(props: Props) {
  const {
    max,
    label,
    amount,
    asset,
    disabled,
    setAmount,
    maxButtonLabel,
    containerClassName,
    onFocus,
    onBlur,
  } = props

  const [prevDenom, setPrevDenom] = useState(asset.denom)

  useEffect(() => {
    if (prevDenom !== asset.denom) {
      setAmount(BN_ZERO)
      setPrevDenom(asset.denom)
    }
  }, [asset.denom, setAmount, prevDenom])

  const handleMaxClick = useCallback(() => {
    setAmount(max)
  }, [max, setAmount])

  const handleChange = useCallback(
    (value: BigNumber) => {
      setAmount(value.isNegative() ? BN_ZERO : value)
    },
    [setAmount],
  )

  const maxValue = useMemo(() => {
    const val = max.shiftedBy(-asset.decimals)
    return val.isGreaterThan(1) ? val.toFixed(2) : val.toPrecision(2)
  }, [asset.decimals, max])

  return (
    <div className={containerClassName}>
      <label>
        {label}
        <div className='flex flex-1 flex-row py-3 border border-white/20 rounded bg-white bg-opacity-5 pl-3 pr-2 mt-2'>
          <NumberInput
            asset={asset}
            amount={amount}
            className='border-none bg-transparent outline-none flex-1 text-left!'
            maxDecimals={asset.decimals}
            disabled={disabled}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <span>{asset.symbol}</span>
        </div>
        <div className='flex flex-row flex-1'>
          <div className='flex flex-row flex-1 mt-2'>
            <span className='text-xs font-bold'>{maxButtonLabel}</span>
            <span className='mx-1 text-xs font-bold text-white text-opacity-60'>{maxValue}</span>
            <div
              className='hover:cursor-pointer select-none bg-white bg-opacity-20 text-2xs leading-3! font-bold py-0.5 px-1.5 rounded'
              onClick={handleMaxClick}
            >
              MAX
            </div>
          </div>
          <div className='mt-2 text-xs text-white text-opacity-60'>
            <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(asset.denom, amount)} />
          </div>
        </div>
      </label>
    </div>
  )
}
