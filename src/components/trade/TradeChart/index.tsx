import classNames from 'classnames'
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import { isMobile } from 'react-device-detect'

import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { LineChart } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { datafeed } from 'components/trade/TradeChart/DataFeed'
import PoweredByPyth from 'components/trade/TradeChart/PoweredByPyth'
import {
  disabledFeatures,
  disabledFeaturesMobile,
  enabledFeatures,
  enabledFeaturesMobile,
} from 'components/trade/TradeChart/constants'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import moment from 'moment'
import { BNCoin } from 'types/classes/BNCoin'
import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  widget,
} from 'utils/charting_library'
import { formatValue, getPriceDecimals, magnify } from 'utils/formatters'
import { getTradingViewSettings } from 'utils/theme'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  title?: ReactNode
  isPerps?: boolean
  perpsPosition?: PerpsPosition
  liquidationPrice?: number
  limitOrders?: PerpPositionRow[]
}

let chartWidget: IChartingLibraryWidget

function getLimitOrderText(
  order: PerpPositionRow,
  buyAsset: Asset,
  currentPosition: 'long' | 'short' | null,
  positionAmount: BigNumber | null,
) {
  let label = 'Limit'

  if (positionAmount && order.amount.abs().isEqualTo(positionAmount.abs())) {
    const isClosing =
      (currentPosition === 'long' && order.tradeDirection === 'short') ||
      (currentPosition === 'short' && order.tradeDirection === 'long')
    if (isClosing) {
      label = 'Close Position'
    }
  }

  const prefix = order.tradeDirection === 'long' ? '+' : '-'
  const amount = formatValue(order.amount.shiftedBy(-buyAsset.decimals).toNumber(), {
    maxDecimals: buyAsset.decimals,
    minDecimals: 0,
    abbreviated: false,
  })

  return `${label}: ${prefix}${amount} ${buyAsset.symbol}`
}

export default function TradeChart(props: Props) {
  const chainConfig = useChainConfig()
  const [chartInterval, _] = useLocalStorage<ResolutionString>(
    LocalStorageKeys.CHART_INTERVAL,
    getDefaultChainSettings(chainConfig).chartInterval,
  )
  const [theme, __] = useLocalStorage<string>(
    LocalStorageKeys.THEME,
    getDefaultChainSettings(chainConfig).theme,
  )

  const [ratio, priceBuyAsset, priceSellAsset] = useMemo(() => {
    const priceBuyAsset = props.buyAsset?.price?.amount
    const priceSellAsset = props.sellAsset?.price?.amount

    if (!priceBuyAsset || !priceSellAsset) return [BN_ZERO]
    return [priceBuyAsset.dividedBy(priceSellAsset), priceBuyAsset, priceSellAsset]
  }, [props.buyAsset, props.sellAsset])

  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>

  const [liquidationPrice, entryPrice, tradeDirection] = useMemo(() => {
    if (!props.isPerps || !props.perpsPosition?.entryPrice) return [null, null, 'long']

    const oraclePriceDecimalDiff = props.buyAsset.decimals - PRICE_ORACLE_DECIMALS
    const entryPrice = props.perpsPosition.entryPrice.shiftedBy(oraclePriceDecimalDiff)
    const liquidationPrice = props.liquidationPrice
    const tradeDirection = props.perpsPosition.amount.isGreaterThan(0) ? 'long' : 'short'

    return [liquidationPrice, entryPrice.toNumber(), tradeDirection]
  }, [props.buyAsset.decimals, props.isPerps, props.liquidationPrice, props.perpsPosition])

  const updateShapes = useCallback(() => {
    const chart = chartWidget.activeChart()
    const settings = getTradingViewSettings(theme)
    const oraclePriceDecimalDiff = props.buyAsset.decimals - PRICE_ORACLE_DECIMALS
    const { downColor, upColor } = settings.chartStyle

    const allShapes = chart.getAllShapes()
    allShapes.forEach((shape) => {
      const currentShape = chart.getShapeById(shape.id).getProperties()

      if (
        (currentShape.text && currentShape.text.includes('Limit')) ||
        currentShape.text.includes('Entry') ||
        currentShape.text.includes('Liquidation') ||
        currentShape.text.includes('Close')
      )
        chart.removeEntity(shape.id)
    })

    if (entryPrice) {
      chart.createShape(
        { price: entryPrice, time: moment().unix() },
        {
          shape: 'horizontal_line',
          lock: true,
          disableSelection: true,
          zOrder: 'top',
          text: 'Entry',
          overrides: {
            linecolor: tradeDirection === 'long' ? upColor : downColor,
            textcolor: tradeDirection === 'long' ? upColor : downColor,
            linestyle: 0,
            linewidth: 1,
            showLabel: true,
          },
        },
      )
    }

    if (liquidationPrice) {
      chart.createShape(
        { price: liquidationPrice, time: moment().unix() },
        {
          shape: 'horizontal_line',
          lock: true,
          disableSelection: true,
          text: 'Liquidation',
          zOrder: 'top',
          overrides: {
            linecolor: '#fdb021',
            linestyle: 0,
            linewidth: 1,
            textcolor: '#fdb021',
            showLabel: true,
          },
        },
      )
    }
    if (props.limitOrders) {
      const currentPosition = props.perpsPosition?.amount.isGreaterThan(0) ? 'long' : 'short'
      const positionAmount = props.perpsPosition?.amount || null

      props.limitOrders.forEach((order) => {
        const price = order.entryPrice.shiftedBy(oraclePriceDecimalDiff).toNumber()

        chart.createShape(
          {
            price: price,
            time: moment().unix(),
          },
          {
            shape: 'horizontal_line',
            lock: true,
            disableSelection: true,
            zOrder: 'top',
            text: getLimitOrderText(order, props.buyAsset, currentPosition, positionAmount),
            overrides: {
              linecolor: order.tradeDirection === 'long' ? upColor : downColor,
              textcolor: order.tradeDirection === 'long' ? upColor : downColor,
              showLabel: true,
              linestyle: 2,
              linewidth: 1,
            },
          },
        )
      })
    }
  }, [
    entryPrice,
    liquidationPrice,
    props.buyAsset,
    props.limitOrders,
    props.perpsPosition,
    theme,
    tradeDirection,
  ])

  // TV initialization
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !window.TradingView ||
      !chartContainerRef.current ||
      !props.buyAsset.denom
    )
      return

    const settings = getTradingViewSettings(theme)

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.buyAsset.pythFeedName ?? `${props.buyAsset.symbol}/USD`,
      datafeed: datafeed,
      interval: chartInterval,
      library_path: '/charting_library/',
      locale: 'en',
      time_scale: {
        min_bar_spacing: 12,
      },
      toolbar_bg: settings.backgroundColor,
      disabled_features: isMobile ? disabledFeaturesMobile : disabledFeatures,
      enabled_features: isMobile ? enabledFeaturesMobile : enabledFeatures,
      fullscreen: false,
      autosize: true,
      container: chartContainerRef.current,
      theme: settings.theme,
      overrides: {
        ...settings.overrides,
        'paneProperties.backgroundType': 'solid',
        'linetooltrendline.linewidth': 2,
        'scalesProperties.fontSize': 12,
      },
      loading_screen: settings.loadingScreen,
      custom_css_url: settings.stylesheet,
    }

    chartWidget = new widget(widgetOptions)
    chartWidget.onChartReady(() => {
      const chart = chartWidget.chart()
      chart.getSeries().setChartStyleProperties(1, settings.chartStyle)
    })

    const chartProperties = localStorage.getItem('tradingview.chartproperties')
    if (chartProperties) {
      const newChartProperties = JSON.parse(chartProperties)
      newChartProperties.paneProperties.backgroundType = 'solid'
      newChartProperties.paneProperties.background = settings.backgroundColor
      newChartProperties.paneProperties.backgroundGradientStartColor = settings.backgroundColor
      newChartProperties.paneProperties.backgroundGradientEndColor = settings.backgroundColor
      localStorage.setItem('tradingview.chartproperties', JSON.stringify(newChartProperties))
    }

    return () => {
      chartWidget.remove()
    }
  }, [
    chartInterval,
    chartContainerRef,
    theme,
    props.buyAsset.symbol,
    props.buyAsset.denom,
    props.buyAsset.pythFeedName,
    props.buyAsset.decimals,
  ])

  // ChartWidget listeners
  useEffect(() => {
    if (!chartWidget || !props.isPerps) return
    chartWidget.onChartReady(() => {
      updateShapes()
      chartWidget
        .activeChart()
        .onIntervalChanged()
        .subscribe(null, () => {
          updateShapes()
        })
    })
  }, [props.isPerps, updateShapes])

  return (
    <Card
      title={
        <div className='flex flex-wrap items-center justify-between w-full p-4 bg-white/10'>
          {props.title ? (
            props.title
          ) : (
            <Text
              size='lg'
              className='flex items-center w-full font-semibold md:pb-0 md:flex-1 md:w-auto'
            >
              Trading Chart
            </Text>
          )}
          {!priceBuyAsset || !priceSellAsset ? null : ratio.isZero() ? (
            <Loading className='h-4 m-4 md:m-0 md:mr-4 w-60' />
          ) : (
            <div className='flex items-center gap-1'>
              <Text size='sm'>1 {props.buyAsset.symbol}</Text>
              {props.isPerps ? (
                <FormattedNumber
                  className='text-sm'
                  amount={Number(props.buyAsset?.price?.amount.toPrecision(6) ?? 0)}
                  options={{
                    prefix: '= ',
                    suffix: ` USD`,
                    abbreviated: false,
                    maxDecimals: getPriceDecimals(props.buyAsset?.price?.amount),
                  }}
                />
              ) : (
                <>
                  <FormattedNumber
                    className='text-sm'
                    amount={Number(ratio.toPrecision(6))}
                    options={{
                      prefix: '= ',
                      suffix: ` ${props.sellAsset.symbol}`,
                      abbreviated: false,
                      maxDecimals: getPriceDecimals(props.sellAsset.price?.amount),
                    }}
                  />

                  <DisplayCurrency
                    parentheses
                    options={{ abbreviated: false }}
                    className='justify-end pl-2 text-sm text-white/50'
                    coin={
                      new BNCoin({
                        denom: props.buyAsset.denom,
                        amount: magnify(1, props.buyAsset).toString(),
                      })
                    }
                  />
                </>
              )}
            </div>
          )}
        </div>
      }
      contentClassName='pb-0.5 h-full !w-[calc(100%-2px)] ml-[1px] bg-chart'
      className={classNames(
        'h-[500px]',
        'md:h-screen/70 md:max-h-[980px] md:min-h-[560px] order-1 w-full',
      )}
    >
      <div ref={chartContainerRef} className='h-[calc(100%-32px)] overflow-hidden'>
        <div className='flex items-center w-full h-full'>
          <div className='flex flex-col flex-wrap items-center w-full gap-2'>
            <div className='w-8 mb-2'>
              <LineChart />
            </div>
            <Text size='lg' className='w-full text-center'>
              Trading View is not installed
            </Text>
            <Text size='sm' className='w-full text-center text-white/60'>
              Charting data is not available.
            </Text>
          </div>
        </div>
      </div>
      <PoweredByPyth />
    </Card>
  )
}
