import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from 'components/Button'
import { hardcodedFee } from 'utils/constants'
import { formatAmountWithSymbol } from 'utils/formatters'
import getRoutes from 'api/swap/routes'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  containerClassName?: string
  buyButtonDisabled: boolean
  buyAction: () => void
}

export default function TradeSummary(props: Props) {
  const { containerClassName, buyAsset, sellAsset, buyAction, buyButtonDisabled } = props

  const [routes, setRoutes] = useState('')
  const [isButtonBusy, setButtonBusy] = useState(false)

  useEffect(() => {
    ;(async function () {
      setButtonBusy(true)
      const routes = await getRoutes(sellAsset.denom, buyAsset.denom)

      if (!routes.length) {
        setRoutes('')
      } else {
        const routeSymbols = routes.map((r) => getAssetByDenom(r.token_out_denom)?.symbol)
        routeSymbols.unshift(sellAsset.symbol)
        setRoutes(routeSymbols.join(' -> '))
      }

      setButtonBusy(false)
    })()
  }, [buyAsset.denom, sellAsset.denom, sellAsset.symbol])

  const handleBuyClick = useCallback(async () => {
    setButtonBusy(true)
    await buyAction()
    setButtonBusy(false)
  }, [buyAction])

  const buttonText = useMemo(
    () => (routes ? `Buy ${buyAsset.symbol}` : 'No route found'),
    [buyAsset.symbol, routes],
  )

  return (
    <div className={classNames(containerClassName, className.container)}>
      <div className={className.summaryWrapper}>
        <span className={className.title}>Summary</span>
        <div className={className.infoLine}>
          <span className={className.infoLineLabel}>Fees</span>
          <span className={className.infoLineText}>
            {formatAmountWithSymbol(hardcodedFee.amount[0])}
          </span>
        </div>
        <div className={className.infoLine}>
          <span className={className.infoLineLabel}>Route</span>
          <span className={className.infoLineText}>{routes || '-'}</span>
        </div>
      </div>
      <Button
        disabled={!routes || buyButtonDisabled}
        showProgressIndicator={isButtonBusy}
        text={buttonText}
        onClick={handleBuyClick}
        size='md'
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
  infoLineText: '',
}
