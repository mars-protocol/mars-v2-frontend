import classNames from 'classnames'
import { useMemo } from 'react'

import ActionButton from 'components/Button/ActionButton'
import useSwapRoute from 'hooks/useSwapRoute'
import { getAssetByDenom } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { formatAmountWithSymbol, formatPercent } from 'utils/formatters'
import useMarketBorrowings from 'hooks/useMarketBorrowings'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  buyButtonDisabled: boolean
  containerClassName?: string
  showProgressIndicator: boolean
  isMargin?: boolean
  borrowAmount: BigNumber
  buyAction: () => void
}

export default function TradeSummary(props: Props) {
  const {
    buyAsset,
    sellAsset,
    buyAction,
    buyButtonDisabled,
    containerClassName,
    isMargin,
    borrowAmount,
    showProgressIndicator,
  } = props
  const { data: borrowAssets } = useMarketBorrowings()

  const borrowAsset = useMemo(
    () => borrowAssets.find((borrowAsset) => borrowAsset.denom == sellAsset.denom),
    [borrowAssets, sellAsset.denom],
  )
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
          <span>{formatAmountWithSymbol(hardcodedFee.amount[0])}</span>
        </div>
        {isMargin && (
          <>
            <div className={className.infoLine}>
              <span className={className.infoLineLabel}>Borrowing</span>
              <span>
                {formatAmountWithSymbol({
                  denom: sellAsset.denom,
                  amount: borrowAmount.toString(),
                })}
              </span>
            </div>
            <div className={className.infoLine}>
              <span className={className.infoLineLabel}>Borrow rate</span>
              <span>{formatPercent(borrowAsset?.borrowRate || 0)}</span>
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
