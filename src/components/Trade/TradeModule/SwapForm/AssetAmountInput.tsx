import classNames from 'classnames'
import { ChangeEvent, useCallback } from 'react'

import NumberInput from 'components/NumberInput'
import { formatValue } from 'utils/formatters'

interface Props {
  label?: string
  max: BigNumber
  asset: Asset
  amount: BigNumber
  maxButtonLabel: string
  assetUSDValue: BigNumber
  amountValueText?: string
  containerClassName?: string
  setAmount: (amount: BigNumber) => void
  onFocus?: () => void
}

export default function AssetAmountInput(props: Props) {
  const {
    label,
    amount,
    setAmount,
    asset,
    containerClassName,
    max,
    maxButtonLabel,
    onFocus,
    assetUSDValue,
  } = props

  const handleMaxClick = useCallback(() => {
    setAmount(max)
  }, [max, setAmount])

  return (
    <div className={classNames(className.container, containerClassName)}>
      <label>
        {label}
        <div className={className.inputWrapper}>
          <NumberInput
            asset={asset}
            amount={amount}
            className={className.input}
            maxDecimals={asset.decimals}
            max={max}
            onChange={setAmount}
            onFocus={onFocus}
          />
          <span>{asset.symbol}</span>
        </div>
        <div className={className.footer}>
          <div className={className.maxButtonWrapper}>
            <span className={className.maxButtonLabel}>{maxButtonLabel}</span>
            <span className={className.maxValue}>{max.shiftedBy(-asset.decimals).toFixed(2)}</span>
            <div className={className.maxButton} onClick={handleMaxClick}>
              MAX
            </div>
          </div>
          <div className={className.assetValue}>
            {formatValue(assetUSDValue.toString(), { prefix: '~ $', minDecimals: 2 })}
          </div>
        </div>
      </label>
    </div>
  )
}

const className = {
  container: '',
  inputWrapper:
    'flex flex-1 flex-row py-3 border-[1px] border-white border-opacity-20 rounded bg-white bg-opacity-5 pl-3 pr-2 mt-2',
  input: 'border-none bg-transparent outline-none flex-1 !text-left',
  footer: 'flex flex-1 flex-row',
  maxButtonWrapper: 'flex flex-1 flex-row mt-2',
  maxButtonLabel: 'font-bold text-xs',
  maxValue: 'font-bold text-xs text-white text-opacity-60 mx-1',
  maxButton:
    'cursor-pointer select-none bg-white bg-opacity-20 text-2xs !leading-3 font-bold py-0.5 px-1.5 rounded',
  assetValue: 'text-xs text-white text-opacity-60 mt-2',
}
