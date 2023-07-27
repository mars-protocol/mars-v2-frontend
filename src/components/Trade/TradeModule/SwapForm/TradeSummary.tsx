import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import ActionButton from 'components/Button/ActionButton'
import useSwapRoute from 'hooks/useSwapRoute'
import { getAssetByDenom } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { formatAmountWithSymbol } from 'utils/formatters'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  containerClassName?: string
  buyButtonDisabled: boolean
  buyAction: () => void
}

export default function TradeSummary(props: Props) {
  const { containerClassName, buyAsset, sellAsset, buyAction, buyButtonDisabled } = props
  const { data: routes, isLoading: isRouteLoading } = useSwapRoute(sellAsset.denom, buyAsset.denom)
  const [isButtonBusy, setButtonBusy] = useState(false)

  const parsedRoutes = useMemo(() => {
    if (!routes.length) return '-'

    const routeSymbols = routes.map((r) => getAssetByDenom(r.token_out_denom)?.symbol)
    routeSymbols.unshift(sellAsset.symbol)

    return routeSymbols.join(' -> ')
  }, [routes, sellAsset.symbol])

  const handleBuyClick = useCallback(async () => {
    setButtonBusy(true)
    await buyAction()
    setButtonBusy(false)
  }, [buyAction])

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
        <div className={className.infoLine}>
          <span className={className.infoLineLabel}>Route</span>
          <span>{parsedRoutes}</span>
        </div>
      </div>
      <ActionButton
        disabled={routes.length === 0 || buyButtonDisabled}
        showProgressIndicator={isButtonBusy || isRouteLoading}
        text={buttonText}
        onClick={handleBuyClick}
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
