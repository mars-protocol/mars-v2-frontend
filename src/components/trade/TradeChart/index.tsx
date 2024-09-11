import classNames from 'classnames'
import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { isMobile } from 'react-device-detect'

import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { LineChart } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { BNCoin } from 'types/classes/BNCoin'
import { ChartingLibraryWidgetOptions, ResolutionString, widget } from 'utils/charting_library'
import { magnify } from 'utils/formatters'
import { getTradingViewSettings } from 'utils/theme'
import { datafeed } from './DataFeed'
import PoweredByPyth from './PoweredByPyth'
import {
  disabledFeatures,
  disabledFeaturesMobile,
  enabledFeatures,
  enabledFeaturesMobile,
} from './constants'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  title?: ReactNode
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
  const { symbol: buyAssetSymbol, pythFeedName: buyAssetFeedName } = props.buyAsset

  useEffect(() => {
    if (typeof window === 'undefined' || !window.TradingView || !chartContainerRef.current) return

    const settings = getTradingViewSettings(theme)

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: buyAssetFeedName ?? `${buyAssetSymbol}/USD`,
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

    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(() => {
      const chart = tvWidget.chart()
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
      tvWidget.remove()
    }
  }, [buyAssetSymbol, buyAssetFeedName, chartInterval, chartContainerRef, theme])

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
              <FormattedNumber
                className='text-sm'
                amount={Number(ratio.toPrecision(6))}
                options={{
                  prefix: '= ',
                  suffix: ` ${props.sellAsset.symbol}`,
                  abbreviated: false,
                  maxDecimals: props.sellAsset.decimals,
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
