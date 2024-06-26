import classNames from 'classnames'
import { useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ChevronDown } from 'components/common/Icons'
import SummaryLine from 'components/common/SummaryLine'
import Text from 'components/common/Text'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useToggle from 'hooks/common/useToggle'
import useLiquidationPrice from 'hooks/prices/useLiquidationPrice'
import useSlippage from 'hooks/settings/useSlippage'
import { BNCoin } from 'types/classes/BNCoin'
import { formatPercent, formatValue } from 'utils/formatters'

interface Props {
  borrowAmount: BigNumber
  borrowRate?: number | null
  buyAction: () => void
  buyAmount: BigNumber
  buyAsset: Asset
  buyButtonDisabled: boolean
  containerClassName?: string
  isMargin?: boolean
  liquidationPrice: number | null
  sellAmount: BigNumber
  sellAsset: Asset
  showProgressIndicator: boolean
  routeInfo?: SwapRouteInfo | null
  isAdvanced?: boolean
  direction?: TradeDirection
  swapTx?: ExecutableTx
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
    sellAmount,
    buyAmount,
    isAdvanced,
    direction,
    routeInfo,
    swapTx,
  } = props
  const [slippage] = useSlippage()
  const assets = useDepositEnabledAssets()
  const [showSummary, setShowSummary] = useToggle()
  const { liquidationPrice, isUpdatingLiquidationPrice } = useLiquidationPrice(
    props.liquidationPrice,
  )

  const minReceive = useMemo(() => {
    return buyAmount.times(1 - (routeInfo?.fee.toNumber() || 0)).times(1 - slippage)
  }, [buyAmount, routeInfo?.fee, slippage])

  const swapFeeAmount = useMemo(() => {
    return sellAmount.times(routeInfo?.fee || 0)
  }, [routeInfo?.fee, sellAmount])

  const buttonText = useMemo(() => {
    if (!isAdvanced && direction === 'short') return `Sell ${sellAsset.symbol}`
    return `Buy ${buyAsset.symbol}`
  }, [isAdvanced, direction, sellAsset.symbol, buyAsset.symbol])

  return (
    <div
      className={classNames(
        containerClassName,
        'flex flex-1 flex-col bg-white/5 rounded border border-white/20',
      )}
    >
      <div className='flex flex-col flex-1 m-3'>
        <SummaryLine label='Liquidation Price'>
          <div className='flex h-2'>
            {isUpdatingLiquidationPrice ? (
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
        <div
          className='relative w-full pr-4 hover:pointer'
          role='button'
          onClick={() => setShowSummary(!showSummary)}
        >
          <Text size='xs' className='font-bold'>
            Summary
          </Text>
          <div
            className={classNames(
              'absolute right-0 w-3 text-center top-1',
              showSummary && 'rotate-180',
            )}
          >
            <ChevronDown />
          </div>
        </div>
        {showSummary && (
          <>
            <SummaryLine label='Price impact' className='mt-2'>
              {routeInfo?.priceImpact ? (
                <FormattedNumber
                  amount={routeInfo?.priceImpact.toNumber() || 0}
                  options={{ suffix: '%' }}
                />
              ) : (
                '-'
              )}
            </SummaryLine>
            <SummaryLine
              label={`Swap fees ${
                routeInfo?.fee
                  ? formatValue(routeInfo.fee.times(100).decimalPlaces(2).toNumber(), {
                      prefix: '(',
                      suffix: '%)',
                    })
                  : ''
              }`}
            >
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber(sellAsset.denom, swapFeeAmount)}
              />
            </SummaryLine>

            <SummaryLine label={`Min receive (${slippage * 100}% slippage)`}>
              <FormattedNumber
                amount={minReceive.toNumber()}
                options={{
                  decimals: buyAsset.decimals,
                  suffix: ` ${buyAsset.symbol}`,
                  maxDecimals: 6,
                }}
              />
            </SummaryLine>
            <Divider className='my-2' />
            <SummaryLine label='Route'>{routeInfo?.description}</SummaryLine>
          </>
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
  )
}
