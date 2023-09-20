import classNames from 'classnames'
import { useMemo } from 'react'

import ActionButton from 'components/Button/ActionButton'
import { FormattedNumber } from 'components/FormattedNumber'
import useSwapRoute from 'hooks/useSwapRoute'
import { getAssetByDenom } from 'utils/assets'
import { formatAmountWithSymbol, formatPercent } from 'utils/formatters'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  borrowRate?: number | null
  buyButtonDisabled: boolean
  containerClassName?: string
  showProgressIndicator: boolean
  isMargin?: boolean
  borrowAmount: BigNumber
  estimatedFee: StdFee
  buyAction: () => void
}

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
  } = props
  const { data: routes, isLoading: isRouteLoading } = useSwapRoute(sellAsset.denom, buyAsset.denom)

  const parsedRoutes = useMemo(() => {
    if (!routes.length) return '-'

    const routeSymbols = routes.map((r) => getAssetByDenom(r.token_out_denom)?.symbol)
    routeSymbols.unshift(sellAsset.symbol)

    return routeSymbols.join(' -> ')
  }, [routes, sellAsset.symbol])

  const buttonText = useMemo(
    () => (routes.length ? `Buy ${buyAsset.symbol}` : 'No route found'),
    [buyAsset.symbol, routes],
  )

  const infoLineClasses = 'flex flex-row justify-between flex-1 mb-1 text-xs text-white'

  return (
    <div
      className={classNames(
        containerClassName,
        'flex flex-1 flex-col bg-white bg-opacity-5 rounded border-[1px] border-white border-opacity-20',
      )}
    >
      <div className='flex flex-col flex-1 m-3'>
        <span className='mb-2 text-xs font-bold'>Summary</span>
        <div className={infoLineClasses}>
          <span className='opacity-40'>Fees</span>
          <span>{formatAmountWithSymbol(estimatedFee.amount[0])}</span>
        </div>
        {isMargin && (
          <>
            <div className={infoLineClasses}>
              <span className='opacity-40'>Borrowing</span>
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
            </div>
            <div className={infoLineClasses}>
              <span className='opacity-40'>Borrow rate</span>
              <span>{formatPercent(borrowRate || 0)}</span>
            </div>
          </>
        )}

        <div className={infoLineClasses}>
          <span className='opacity-40'>Route</span>
          <span>{parsedRoutes}</span>
        </div>
      </div>
      <ActionButton
        disabled={routes.length === 0 || buyButtonDisabled}
        showProgressIndicator={showProgressIndicator || isRouteLoading}
        text={buttonText}
        onClick={buyAction}
        size='md'
        color='primary'
        className='w-full'
      />
    </div>
  )
}
