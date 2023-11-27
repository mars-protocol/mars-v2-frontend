import classNames from 'classnames'
import debounce from 'lodash.debounce'
import React, { useEffect, useMemo, useState } from 'react'

import ActionButton from 'components/Button/ActionButton'
import { CircularProgress } from 'components/CircularProgress'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { FormattedNumber } from 'components/FormattedNumber'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrice from 'hooks/usePrice'
import useSwapFee from 'hooks/useSwapFee'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'
import { formatAmountWithSymbol, formatPercent } from 'utils/formatters'

interface Props {
  borrowAmount: BigNumber
  borrowRate?: number | null
  buyAction: () => void
  buyAmount: BigNumber
  buyAsset: Asset
  buyButtonDisabled: boolean
  containerClassName?: string
  estimatedFee: StdFee
  isMargin?: boolean
  liquidationPrice: number | null
  route: Route[]
  sellAmount: BigNumber
  sellAsset: Asset
  showProgressIndicator: boolean
}

const infoLineClasses = 'flex flex-row justify-between flex-1 mb-1 text-xs text-white'

export default function TradeSummary(props: Props) {
  const {
    buyAsset,
    sellAsset,
    borrowRate,
    buyAction,
    buyButtonDisabled,
    containerClassName,
    isMargin,
    borrowAmount,
    estimatedFee,
    showProgressIndicator,
    route,
    sellAmount,
    buyAmount,
  } = props
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)

  const sellAssetPrice = usePrice(sellAsset.denom)
  const swapFee = useSwapFee(route.map((r) => r.pool_id))
  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(null)
  const [isUpdatingLiquidationPrice, setIsUpdatingLiquidationPrice] = useState(false)
  const debouncedSetLiqPrice = useMemo(
    () => debounce(setLiquidationPrice, 1000, { leading: false }),
    [],
  )

  const minReceive = useMemo(() => {
    return buyAmount.times(1 - swapFee).times(1 - slippage)
  }, [buyAmount, slippage, swapFee])

  useEffect(() => {
    setIsUpdatingLiquidationPrice(true)
    debouncedSetLiqPrice(props.liquidationPrice)
  }, [debouncedSetLiqPrice, props.liquidationPrice])

  useEffect(() => setIsUpdatingLiquidationPrice(false), [liquidationPrice])

  const swapFeeValue = useMemo(() => {
    return sellAssetPrice.times(swapFee).times(sellAmount)
  }, [sellAmount, sellAssetPrice, swapFee])

  const parsedRoutes = useMemo(() => {
    if (!route.length) return '-'

    const routeSymbols = route.map((r) => getAssetByDenom(r.token_out_denom)?.symbol)
    routeSymbols.unshift(sellAsset.symbol)

    return routeSymbols.join(' -> ')
  }, [route, sellAsset.symbol])

  const buttonText = useMemo(
    () => (route.length ? `Buy ${buyAsset.symbol}` : 'No route found'),
    [buyAsset.symbol, route],
  )

  return (
    <div
      className={classNames(
        containerClassName,
        'flex flex-1 flex-col bg-white bg-opacity-5 rounded border-[1px] border-white/20',
      )}
    >
      <div className='flex flex-col flex-1 m-3'>
        <span className='mb-2 text-xs font-bold'>Summary</span>
        {isMargin && (
          <>
            <SummaryLine label='Borrowing'>
              <FormattedNumber
                amount={borrowAmount.toNumber()}
                options={{
                  decimals: sellAsset.decimals,
                  maxDecimals: sellAsset.decimals,
                  minDecimals: 0,
                  suffix: ` ${sellAsset.symbol}`,
                  abbreviated: true,
                  rounded: true,
                }}
                animate
              />
            </SummaryLine>
            <SummaryLine label='Borrow Rate APY'>
              <span>{formatPercent(borrowRate || 0)}</span>
            </SummaryLine>
            <Divider className='my-2' />
          </>
        )}
        <>
          <SummaryLine label='Liquidation Price'>
            <div className='flex h-2'>
              {isUpdatingLiquidationPrice ? (
                <CircularProgress className='opacity-50' />
              ) : liquidationPrice === null || liquidationPrice === 0 ? (
                '-'
              ) : (
                <FormattedNumber
                  className='inline'
                  amount={liquidationPrice}
                  options={{ abbreviated: true, prefix: `${props.buyAsset.symbol} = $ ` }}
                />
              )}
            </div>
          </SummaryLine>
          <Divider className='my-2' />
        </>
        <SummaryLine label={`Swap fees (${(swapFee || 0.002) * 100}%)`}>
          <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(sellAsset.denom, swapFeeValue)} />
        </SummaryLine>
        <SummaryLine label='Transaction fees'>
          <span>{formatAmountWithSymbol(estimatedFee.amount[0])}</span>
        </SummaryLine>
        <SummaryLine label={`Min receive (${slippage * 100}% slippage)`}>
          <FormattedNumber
            amount={minReceive.toNumber()}
            options={{ decimals: buyAsset.decimals, suffix: ` ${buyAsset.symbol}`, maxDecimals: 6 }}
          />
        </SummaryLine>
        <Divider className='my-2' />
        <SummaryLine label='Route'>{parsedRoutes}</SummaryLine>
      </div>
      <ActionButton
        disabled={buyButtonDisabled}
        showProgressIndicator={showProgressIndicator}
        text={buttonText}
        onClick={buyAction}
        size='md'
        color='primary'
        className='w-full'
      />
    </div>
  )
}

interface SummaryLineProps {
  children: React.ReactNode
  label: string
}
function SummaryLine(props: SummaryLineProps) {
  return (
    <div className={infoLineClasses}>
      <span className='opacity-40'>{props.label}</span>
      <span>{props.children}</span>
    </div>
  )
}
