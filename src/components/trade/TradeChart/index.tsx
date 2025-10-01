import classNames from 'classnames'
import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef } from 'react'
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
import { formatValue, getPerpsPriceDecimals, magnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { getTradingViewSettings } from 'utils/theme'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  title?: ReactNode
  isPerps?: boolean
  perpsPosition?: PerpsPosition
  liquidationPrice?: number
  limitOrders?: PerpPositionRow[]
  isTab?: boolean
  onCreateLimitOrder?: (price: BigNumber) => void
  onCreateStopOrder?: (price: BigNumber) => void
}

let chartWidget: IChartingLibraryWidget

function getLimitOrderText(
  order: PerpPositionRow,
  buyAsset: Asset,
  currentPosition: 'long' | 'short' | null,
  positionAmount: BigNumber | null,
) {
  let label = order.type === 'stop' ? 'Stop' : 'Limit'
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

function isAutomaticAddedLine(shapeName: string, shape: any) {
  if (!shapeName || !shape.text || shapeName !== 'horizontal_line') return false

  return (
    shape.text.includes('Limit') ||
    shape.text.includes('Stop') ||
    shape.text.includes('Entry') ||
    shape.text.includes('Liquidation') ||
    shape.text.includes('Close')
  )
}

function getChartName(props: Props) {
  return `${props.buyAsset.symbol}-${props.sellAsset.symbol}${props.isPerps ? '-perps' : ''}`
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

  const [tvChartStore, setTvChartStore] = useLocalStorage<string>(
    LocalStorageKeys.TV_CHART_STORE,
    getDefaultChainSettings(chainConfig).tvChartStore,
  )
  const chartName = useMemo(() => getChartName(props), [props])

  const { onCreateLimitOrder, onCreateStopOrder, isPerps } = props

  const [ratio, priceBuyAsset, priceSellAsset] = useMemo(() => {
    const priceBuyAsset = props.buyAsset?.price?.amount
    const priceSellAsset = props.sellAsset?.price?.amount

    if (!priceBuyAsset || !priceSellAsset) return [BN_ZERO]
    return [priceBuyAsset.dividedBy(priceSellAsset), priceBuyAsset, priceSellAsset]
  }, [props.buyAsset, props.sellAsset])

  const chartContainerRef = useRef<HTMLDivElement | null>(
    null,
  ) as RefObject<HTMLInputElement | null>

  const [liquidationPrice, entryPrice, tradeDirection] = useMemo(() => {
    if (!props.isPerps || !props.perpsPosition?.entryPrice) return [null, null, 'long']

    const oraclePriceDecimalDiff = props.buyAsset.decimals - PRICE_ORACLE_DECIMALS
    const entryPrice = props.perpsPosition.entryPrice.shiftedBy(oraclePriceDecimalDiff)
    const liquidationPrice = props.liquidationPrice
    const tradeDirection = props.perpsPosition.amount.isGreaterThan(0) ? 'long' : 'short'

    return [liquidationPrice, entryPrice.toNumber(), tradeDirection]
  }, [props.buyAsset.decimals, props.isPerps, props.liquidationPrice, props.perpsPosition])

  const intitalChartLoad = useCallback(() => {
    try {
      const chart = chartWidget.activeChart()
      if (!chart) return
      const chartStore = JSON.parse(localStorage.getItem(LocalStorageKeys.TV_CHART_STORE) ?? '{}')
      const currentChartShapeStore = chartStore[chartName]
      if (!currentChartShapeStore) return
      currentChartShapeStore.forEach((shape: TradingViewShape) => {
        if (Array.isArray(shape.points)) {
          if (shape.points.length === 0) return
          chart.createMultipointShape(shape.points, shape.shape)
        } else {
          chart.createShape(shape.points, shape.shape)
        }
      })
      const currentChartStudyStore = chartStore[`${chartName}-studies`]
      if (!currentChartStudyStore) return
      currentChartStudyStore.forEach((studyName: string) => {
        chart.createStudy(studyName)
      })
      if (!isPerps || !onCreateLimitOrder || !onCreateStopOrder) return
      chartWidget.onContextMenu((unixTime, price) => {
        return [
          {
            position: 'top',
            text: 'Set Limit Order Price',
            click: () => {
              onCreateLimitOrder?.(BN(price))
            },
          },
          {
            position: 'top',
            text: 'Set Stop Order Price',
            click: () => {
              onCreateStopOrder?.(BN(price))
            },
          },
        ]
      })
    } catch (e) {
      console.info('Error on loading chart', e)
      return
    }
  }, [chartName, isPerps, onCreateLimitOrder, onCreateStopOrder])

  const updateShapesAndStudies = useCallback(() => {
    try {
      const chart = chartWidget.activeChart()
      const settings = getTradingViewSettings(theme)
      const oraclePriceDecimalDiff = props.buyAsset.decimals - PRICE_ORACLE_DECIMALS
      const { downColor, upColor } = settings.chartStyle
      const currentShapes = [] as TradingViewShape[]
      const currentStudies = [] as string[]
      const allShapes = chart.getAllShapes()
      const allStudies = chart.getAllStudies()

      allShapes.forEach((shape) => {
        const currentShape = chart.getShapeById(shape.id).getProperties()
        const currentShapePoints = chart.getShapeById(shape.id).getPoints()
        if (isAutomaticAddedLine(shape.name, currentShape)) {
          chart.removeEntity(shape.id)
        } else {
          currentShapes.push({
            points: currentShapePoints,
            shape: { ...currentShape, shape: shape.name as TradingViewShapeNames },
          })
        }
      })

      allStudies.forEach((study) => {
        currentStudies.push(study.name)
      })

      const newTvChartStore = JSON.stringify({
        ...JSON.parse(tvChartStore),
        [chartName]: currentShapes,
        [`${chartName}-studies`]: currentStudies,
      })
      setTvChartStore(newTvChartStore)

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
    } catch (e) {
      console.info('Error on updating chart', e)
      return
    }
  }, [
    chartName,
    entryPrice,
    liquidationPrice,
    props.buyAsset,
    props.limitOrders,
    props.perpsPosition?.amount,
    setTvChartStore,
    theme,
    tradeDirection,
    tvChartStore,
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
      symbol: props.buyAsset.pythFeedName ?? `${props.buyAsset.symbol.toUpperCase()}/USD`,
      datafeed: datafeed,
      interval: chartInterval,
      library_path: '/charting_library/',
      locale: 'en',
      toolbar_bg: settings.backgroundColor,
      disabled_features: isMobile ? disabledFeaturesMobile : disabledFeatures,
      enabled_features: isMobile ? enabledFeaturesMobile : enabledFeatures,
      fullscreen: false,
      autosize: true,
      container: chartContainerRef.current,
      theme: settings.theme,
      overrides: {
        ...settings.overrides,
      },
      loading_screen: settings.loadingScreen,
      custom_css_url: settings.stylesheet,
    }

    chartWidget = new widget(widgetOptions)
    chartWidget.onChartReady(() => {
      const chart = chartWidget.chart()
      chart.getSeries().setChartStyleProperties(1, settings.chartStyle)
      intitalChartLoad()
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
    intitalChartLoad,
  ])

  // ChartWidget listeners
  useEffect(() => {
    if (!chartWidget) return
    chartWidget.onChartReady(() => {
      updateShapesAndStudies()
      chartWidget
        .activeChart()
        .onIntervalChanged()
        .subscribe(null, () => {
          updateShapesAndStudies()
        })
    })
  }, [updateShapesAndStudies])

  const { isTab = false } = props
  return (
    <Card
      title={
        <div className='flex flex-wrap items-center justify-between w-full p-4 '>
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
            <div className='hidden md:flex md:items-center md:gap-1 md:flex-nowrap'>
              <Text size='sm'>1 {props.buyAsset.symbol}</Text>
              {props.isPerps ? (
                <FormattedNumber
                  className='text-sm'
                  amount={Number(props.buyAsset?.price?.amount ?? 0)}
                  options={{
                    prefix: '= $',
                    abbreviated: false,
                    maxDecimals: getPerpsPriceDecimals(props.buyAsset?.price?.amount),
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
                      maxDecimals: getPerpsPriceDecimals(props.sellAsset.price?.amount),
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
      contentClassName='flex flex-col h-full w-full bg-surface-dark'
      className={classNames('w-full h-full')}
      isTab={isTab}
    >
      <div ref={chartContainerRef ?? undefined} className='flex-1 overflow-hidden'>
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
