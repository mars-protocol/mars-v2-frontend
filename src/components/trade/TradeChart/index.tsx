import classNames from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { ChartingLibraryWidgetOptions, ResolutionString, widget } from 'utils/charting_library'
import { magnify } from 'utils/formatters'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function TradeChart(props: Props) {
  const [isServer, setIsServer] = useState(true)
  const { data: prices, isLoading } = usePrices()
  const [chartInterval, _] = useLocalStorage<ResolutionString>(
    LocalStorageKeys.CHART_INTERVAL,
    DEFAULT_SETTINGS.chartInterval,
  )
  const ratio = useMemo(() => {
    const priceBuyAsset = prices.find(byDenom(props.buyAsset.denom))?.amount
    const priceSellAsset = prices.find(byDenom(props.sellAsset.denom))?.amount

    if (!priceBuyAsset || !priceSellAsset) return BN_ZERO
    return priceBuyAsset.dividedBy(priceSellAsset)
  }, [prices, props.buyAsset.denom, props.sellAsset.denom])

  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>

  useEffect(() => {
    setIsServer(false)
  }, [])

  useEffect(() => {
    if (isServer) return
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.buyAsset.pythFeedName ?? `${props.buyAsset.symbol}/USD`,
      datafeed: datafeed,
      interval: chartInterval,
      library_path: '/charting_library/',
      locale: 'en',
      time_scale: {
        min_bar_spacing: isMobile ? 2 : 12,
      },
      toolbar_bg: '#220E1D',
      disabled_features: isMobile ? disabledFeaturesMobile : disabledFeatures,
      enabled_features: isMobile ? enabledFeaturesMobile : enabledFeatures,
      fullscreen: false,
      autosize: true,
      container: chartContainerRef.current,
      theme: 'dark',
      overrides: {
        'paneProperties.background': '#220E1D',
        'paneProperties.backgroundType': 'solid',
        'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.8)',
        'linetooltrendline.linewidth': 2,
        'scalesProperties.fontSize': 12,
      },
      loading_screen: {
        backgroundColor: '#220E1D',
        foregroundColor: 'rgba(255, 255, 255, 0.3)',
      },
      custom_css_url: '/tradingview.css',
    }

    const tvWidget = new widget(widgetOptions)
    tvWidget.onChartReady(() => {
      const chart = tvWidget.chart()
      chart.getSeries().setChartStyleProperties(1, {
        upColor: '#3DAE9A',
        downColor: '#AE3D3D',
        borderColor: '#232834',
        borderUpColor: '#3DAE9A',
        borderDownColor: '#AE3D3D',
        wickUpColor: '#3DAE9A',
        wickDownColor: '#AE3D3D',
        barColorsOnPrevClose: false,
      })
    })

    const chartProperties = localStorage.getItem('tradingview.chartproperties')
    if (chartProperties) {
      const newChartProperties = JSON.parse(chartProperties)
      newChartProperties.paneProperties.backgroundType = 'solid'
      newChartProperties.paneProperties.background = '#220E1D'
      newChartProperties.paneProperties.backgroundGradientStartColor = '#220E1D'
      newChartProperties.paneProperties.backgroundGradientEndColor = '#220E1D'
      localStorage.setItem('tradingview.chartproperties', JSON.stringify(newChartProperties))
    }
  }, [props.buyAsset.pythFeedName, props.buyAsset.symbol, chartInterval, isServer])

  return (
    <Card
      title={
        <div className='flex flex-wrap items-center w-full bg-white/10'>
          <Text
            size='lg'
            className='flex items-center w-full p-4 pb-0 font-semibold md:pb-4 md:flex-1 md:w-auto'
          >
            Trading Chart
          </Text>
          {ratio.isZero() || isLoading ? (
            <Loading className='h-4 m-4 md:m-0 md:mr-4 w-60 ' />
          ) : (
            <div className='flex items-center gap-1 p-4'>
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
