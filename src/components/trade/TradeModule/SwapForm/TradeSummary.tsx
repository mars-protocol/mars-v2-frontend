import classNames from 'classnames'

import Button from 'components/common/Button'
import ActionButton from 'components/common/Button/ActionButton'
import { Callout, CalloutType } from 'components/common/Callout'
import { CircularProgress } from 'components/common/CircularProgress'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { RouteInfo } from 'components/common/RouteInfo'
import SummaryLine from 'components/common/SummaryLine'
import { BN_ZERO } from 'constants/math'
import useLiquidationPrice from 'hooks/prices/useLiquidationPrice'
import useSlippage from 'hooks/settings/useSlippage'
import { useMemo } from 'react'
import useStore from 'store'
import { formatPercent } from 'utils/formatters'
import { getMinAmountOutFromRouteInfo } from 'utils/swap'

interface Props {
  borrowAmount: BigNumber
  borrowRate?: number | null
  buyAction: () => void
  buyAsset: Asset
  buyButtonDisabled: boolean
  containerClassName?: string
  isMargin?: boolean
  liquidationPrice: number | null
  sellAsset: Asset
  showProgressIndicator: boolean
  routeInfo?: SwapRouteInfo | null
  isAdvanced?: boolean
  direction?: TradeDirection
  hasInsufficientFunds?: boolean
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
    showProgressIndicator,
    isAdvanced,
    direction,
    routeInfo,
    hasInsufficientFunds,
  } = props
  const [slippage] = useSlippage()
  const { liquidationPrice, isUpdatingLiquidationPrice } = useLiquidationPrice(
    props.liquidationPrice,
  )

  const minReceive = useMemo(() => {
    if (!routeInfo) return BN_ZERO
    return getMinAmountOutFromRouteInfo(routeInfo, slippage)
  }, [routeInfo, slippage])

  const buttonText = useMemo(() => {
    if (hasInsufficientFunds) return 'Insufficient Funds'
    if (!isAdvanced && direction === 'short') return `Sell ${sellAsset.symbol}`
    return `Buy ${buyAsset.symbol}`
  }, [hasInsufficientFunds, isAdvanced, direction, sellAsset.symbol, buyAsset.symbol])

  return (
    <div className='flex flex-col w-full space-y-2'>
      {routeInfo && routeInfo.priceImpact.abs().toNumber() > 5 && (
        <Callout type={CalloutType.WARNING}>
          Your trade's price impact exceeds 5%. Please review the Summary before submitting the
          transaction.
        </Callout>
      )}
      {routeInfo && slippage * 100 > 1 && (
        <Callout type={CalloutType.WARNING}>
          Your slippage exceeds 1%. Please review the Summary before submitting the transaction or
          change your Slippage in the
          <span className='inline-block'>
            <Button
              onClick={() => useStore.setState({ settingsModal: true })}
              variant='transparent'
              color='quaternary'
              size='xs'
              className='underline hover:no-underline'
              text='Settings'
            />
          </span>
        </Callout>
      )}
      <div
        className={classNames(
          containerClassName,
          'flex flex-1 flex-col bg-white/5 rounded-sm border border-white/10',
        )}
      >
        <div className='flex flex-col flex-1 m-3'>
          <SummaryLine label='Liquidation Price'>
            <div className='flex h-2'>
              {isUpdatingLiquidationPrice && buyButtonDisabled ? (
                <CircularProgress size={10} />
              ) : liquidationPrice === null || liquidationPrice === 0 ? (
                '-'
              ) : (
                <FormattedNumber
                  className='inline'
                  amount={liquidationPrice}
                  options={{ abbreviated: true, prefix: `${props.buyAsset.symbol} = $` }}
                />
              )}
            </div>
          </SummaryLine>
          <Divider className='my-2' />
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
                />
              </SummaryLine>
              <SummaryLine label='Borrow Rate APY'>
                <span>{formatPercent(borrowRate || 0)}</span>
              </SummaryLine>
              <Divider className='my-2' />
            </>
          )}
          {routeInfo && (
            <RouteInfo
              title='Summary'
              route={routeInfo}
              assets={{ in: sellAsset, out: buyAsset }}
              tradeInfo={{ slippage, minReceive }}
            />
          )}
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
    </div>
  )
}
