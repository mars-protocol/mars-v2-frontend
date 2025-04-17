import classNames from 'classnames'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import NumberInput from 'components/common/NumberInput'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { formatValue } from 'utils/formatters'

interface Props {
  label?: string
  max?: BigNumber
  asset: Asset
  amount: BigNumber
  disabled?: boolean
  maxButtonLabel?: string
  containerClassName?: string
  setAmount: (amount: BigNumber) => void
  onFocus?: () => void
  onBlur?: () => void
  isUSD?: boolean
  onClosing?: () => void
  showCloseButton?: boolean
  isMaxSelected?: boolean
  capMax?: boolean
  assetSwitch?: ReactNode
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
    isUSD,
    onClosing,
    showCloseButton,
    isMaxSelected,
    capMax,
    assetSwitch,
  } = props

  const assetPrice = useMemo(() => {
    return asset.price?.amount || BN_ZERO
  }, [asset.price])

  const handleMaxClick = useCallback(() => {
    if (!max || disabled) return
    setAmount(max)
  }, [max, setAmount, disabled])

  const maxValue = useMemo(() => {
    if (!max) return
    const val = max.shiftedBy(-asset.decimals)
    return val.isGreaterThan(1) ? val.toFixed(2) : val.toPrecision(2)
  }, [asset.decimals, max])

  useEffect(() => {
    if (!disabled) return
    setAmount(BN_ZERO)
  }, [disabled, setAmount])

  useEffect(() => {
    if (isMaxSelected && max) {
      setAmount(max)
    }
  }, [isMaxSelected, max, setAmount, isUSD])

  const nativeAssetAmount = useMemo(() => {
    if (isUSD && !assetPrice.isZero()) {
      return amount.shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS).div(assetPrice)
    }
    return amount
  }, [isUSD, amount, assetPrice, asset.decimals])

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
            key={isUSD ? 'usd-input' : 'asset-input'}
            asset={asset}
            className='border-none bg-transparent outline-none flex-1 !text-left'
            maxDecimals={isUSD ? 2 : asset.decimals}
            max={capMax ? max : undefined}
            disabled={disabled}
            onChange={setAmount}
            onFocus={onFocus}
            onBlur={onBlur}
            isUSD={isUSD}
            amount={amount}
          />
          <div className='flex items-center'>
            {assetSwitch ?? <span>{isUSD ? 'USD' : asset.symbol}</span>}
          </div>
        </div>
        <div className='flex items-center'>
          {maxValue && (
            <div
              className={classNames(
                'flex flex-row flex-1',
                disabled && 'pointer-events-none opacity-50',
              )}
            >
              <div className='flex flex-row flex-1 mt-2'>
                <span className='text-xs font-bold'>{maxButtonLabel ?? 'Max:'}</span>
                <span className='mx-1 text-xs font-bold text-white text-opacity-60'>
                  {formatValue(Number(maxValue), { abbreviated: false })}
                </span>
                <div
                  className='hover:cursor-pointer select-none bg-white bg-opacity-20 text-2xs !leading-3 font-bold py-0.5 px-1.5 rounded'
                  onClick={handleMaxClick}
                >
                  MAX
                </div>
                {showCloseButton && onClosing && (
                  <div
                    className='hover:cursor-pointer select-none bg-white bg-opacity-20 text-2xs !leading-3 font-bold py-0.5 px-1.5 rounded ml-2'
                    onClick={onClosing}
                  >
                    CLOSE
                  </div>
                )}
              </div>

              <div className='mt-2 text-xs text-white text-opacity-60'>
                {isUSD ? (
                  <div>
                    {formatValue(Number(nativeAssetAmount.shiftedBy(-asset.decimals).toString()), {
                      abbreviated: false,
                      maxDecimals: 6,
                    })}{' '}
                    {asset.symbol}
                  </div>
                ) : (
                  <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(asset.denom, amount)} />
                )}
              </div>
            </div>
          )}
        </div>
      </label>
    </div>
  )
}
