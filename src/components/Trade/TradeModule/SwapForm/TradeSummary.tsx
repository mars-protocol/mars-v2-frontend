import classNames from 'classnames'
import React, { useMemo } from 'react'

import ActionButton from 'components/Button/ActionButton'
import { CircularProgress } from 'components/CircularProgress'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown } from 'components/Icons'
import SummaryLine from 'components/SummaryLine'
import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useLiquidationPrice from 'hooks/useLiquidationPrice'
import usePrice from 'hooks/usePrice'
import useSwapFee from 'hooks/useSwapFee'
import useToggle from 'hooks/useToggle'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
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
  isAdvanced?: boolean
  direction?: TradeDirection
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
    route,
    sellAmount,
    buyAmount,
    isAdvanced,
    direction,
  } = props
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const assets = useAllAssets()
  const sellAssetPrice = usePrice(sellAsset.denom)
  // FIXME: ⛓️ Swap fee needs to be chainagnostic!
  const swapFee = useSwapFee([])
  const [showSummary, setShowSummary] = useToggle()
  const { liquidationPrice, isUpdatingLiquidationPrice } = useLiquidationPrice(
    props.liquidationPrice,
  )

  const minReceive = useMemo(() => {
    return buyAmount.times(1 - swapFee).times(1 - slippage)
  }, [buyAmount, slippage, swapFee])

  const swapFeeValue = useMemo(() => {
    return sellAssetPrice.times(swapFee).times(sellAmount)
  }, [sellAmount, sellAssetPrice, swapFee])

  const parsedRoutes = useMemo(() => {
    if (!route.length) return '-'

    const routeSymbols = route.map((r) => assets.find(byDenom(r.token_out_denom))?.symbol)
    routeSymbols.unshift(sellAsset.symbol)

    return routeSymbols.join(' -> ')
  }, [assets, route, sellAsset.symbol])

  const buttonText = useMemo(() => {
    if (!isAdvanced && direction === 'short') return `Sell ${sellAsset.symbol}`
    return route.length ? `Buy ${buyAsset.symbol}` : 'No route found'
  }, [buyAsset.symbol, route, sellAsset.symbol, isAdvanced, direction])

  return (
    <div
      className={classNames(
        containerClassName,
        'flex flex-1 flex-col bg-white bg-opacity-5 rounded border-[1px] border-white/20',
      )}
    >
      <div className='flex flex-col flex-1 m-3'>
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
            <SummaryLine label={`Swap fees (${(swapFee || 0.002) * 100}%)`} className='mt-2'>
              <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(sellAsset.denom, swapFeeValue)} />
            </SummaryLine>
            <SummaryLine label='Transaction fees'>
              <span>{formatAmountWithSymbol(estimatedFee.amount[0], assets)}</span>
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
            <SummaryLine label='Route'>{parsedRoutes}</SummaryLine>
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
