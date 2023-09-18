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

  return (
    <div className={classNames(containerClassName, className.container)}>
      <div className={className.summaryWrapper}>
        <span className={className.title}>Summary</span>
        <div className={className.infoLine}>
          <span className={className.infoLineLabel}>Fees</span>
          <span>{formatAmountWithSymbol(estimatedFee.amount[0])}</span>
        </div>
        {isMargin && (
          <>
            <div className={className.infoLine}>
              <span className={className.infoLineLabel}>Borrowing</span>
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
            <div className={className.infoLine}>
              <span className={className.infoLineLabel}>Borrow rate</span>
              <span>{formatPercent(borrowRate || 0)}</span>
            </div>
          </>
        )}

        <div className={className.infoLine}>
          <span className={className.infoLineLabel}>Route</span>
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

const className = {
  container:
    'flex flex-1 flex-col bg-white bg-opacity-5 rounded border-[1px] border-white border-opacity-20 ',
  title: 'text-xs font-bold mb-2',
  summaryWrapper: 'flex flex-1 flex-col m-3',
  infoLine: 'flex flex-1 flex-row text-xs text-white justify-between mb-1',
  infoLineLabel: 'opacity-40',
}
