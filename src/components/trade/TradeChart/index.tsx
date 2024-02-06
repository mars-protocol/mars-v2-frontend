import { useEffect, useMemo, useRef } from 'react'

import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { datafeed } from 'components/trade/TradeChart/DataFeed'
import PoweredByPyth from 'components/trade/TradeChart/PoweredByPyth'
import { disabledFeatures, enabledFeatures } from 'components/trade/TradeChart/constants'
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
    if (typeof window !== 'undefined' && window.TradingView) {
      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: props.buyAsset.pythFeedName ?? `${props.buyAsset.symbol}/USD`,
        datafeed: datafeed,
        interval: chartInterval,
        library_path: '/charting_library/',
        locale: 'en',
        time_scale: {
          min_bar_spacing: 12,
        },
        toolbar_bg: '#220E1D',
        disabled_features: disabledFeatures,
        enabled_features: enabledFeatures,
        fullscreen: false,
        autosize: true,
        container: chartContainerRef.current,
        theme: 'dark',
        overrides: {
          'paneProperties.background': '#220E1D',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.backgroundGradientStartColor': '#220E1D',
          'paneProperties.backgroundGradientEndColor': '#220E1D',
          'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.8)',
          'linetooltrendline.linewidth': 2,
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
    }
  }, [props.buyAsset.pythFeedName, props.buyAsset.symbol, chartInterval])

  return (
    <Card
      title={
        <div className='flex items-center w-full bg-white/10'>
          <Text size='lg' className='flex items-center flex-1 p-4 font-semibold'>
            Trading Chart
          </Text>
          {ratio.isZero() || isLoading ? (
            <Loading className='h-4 mr-4 w-60' />
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
      contentClassName='px-0.5 pb-0.5 h-full bg-chart w-[calc(100%-2px)] ml-[1px]'
      className='h-[70dvh] max-h-[980px] min-h-[560px]'
    >
      <div ref={chartContainerRef} className='h-[calc(100%-32px)] overflow-hidden' />
      <PoweredByPyth />
    </Card>
  )
}
