import { useEffect, useMemo, useRef } from 'react'

import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import Text from 'components/Text'
import { disabledFeatures, enabledFeatures, overrides } from 'components/Trade/TradeChart/constants'
import { DataFeed, PAIR_SEPARATOR } from 'components/Trade/TradeChart/DataFeed'
import { BN_ZERO } from 'constants/math'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  Timezone,
  widget,
} from 'utils/charting_library'
import { magnify } from 'utils/formatters'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export const TVChartContainer = (props: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  const widgetRef = useRef<IChartingLibraryWidget>()
  const defaultSymbol = useRef<string>(
    `${props.sellAsset.denom}${PAIR_SEPARATOR}${props.buyAsset.denom}`,
  )
  const baseCurrency = useStore((s) => s.baseCurrency)
  const dataFeed = useMemo(
    () => new DataFeed(false, baseCurrency.decimals, baseCurrency.denom),
    [baseCurrency],
  )
  const { data: prices, isLoading } = usePrices()
  const ratio = useMemo(() => {
    const priceBuyAsset = prices.find(byDenom(props.buyAsset.denom))?.amount
    const priceSellAsset = prices.find(byDenom(props.sellAsset.denom))?.amount

    if (!priceBuyAsset || !priceSellAsset) return BN_ZERO
    return priceBuyAsset.dividedBy(priceSellAsset)
  }, [prices, props.buyAsset.denom, props.sellAsset.denom])

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: defaultSymbol.current,
      datafeed: dataFeed,
      interval: '1h' as ResolutionString,
      library_path: '/charting_library/',
      locale: 'en',
      time_scale: {
        min_bar_spacing: 12,
      },
      toolbar_bg: '#220E1D',
      disabled_features: disabledFeatures,
      enabled_features: enabledFeatures,
      charts_storage_api_version: '1.1',
      client_id: 'sample-implementation',
      timezone: 'Etc/UTC' as Timezone,
      user_id: 'not-set',
      fullscreen: false,
      autosize: true,
      container: chartContainerRef.current,
      custom_css_url: '/tradingview.css',
      settings_overrides: {
        'paneProperties.background': '#220E1D',
        'paneProperties.backgroundType': 'solid',
        'paneProperties.vertGridProperties.color': '#220E1D',
        'paneProperties.horzGridProperties.color': '#220E1D',
        'mainSeriesProperties.candleStyle.upColor': '#3DAE9A',
        'mainSeriesProperties.candleStyle.downColor': '#AE3D3D',
        'mainSeriesProperties.candleStyle.borderColor': '#232834',
        'mainSeriesProperties.candleStyle.borderUpColor': '#3DAE9A',
        'mainSeriesProperties.candleStyle.borderDownColor': '#AE3D3D',
        'mainSeriesProperties.candleStyle.wickUpColor': '#3DAE9A',
        'mainSeriesProperties.candleStyle.wickDownColor': '#AE3D3D',
        'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
        'scalesProperties.textColor': 'rgba(255, 255, 255, 0.7)',
        'paneProperties.legendProperties.showSeriesTitle': true,
        'paneProperties.legendProperties.showVolume': false,
        'paneProperties.legendProperties.showStudyValues': false,
        'paneProperties.legendProperties.showStudyTitles': false,
        'scalesProperties.axisHighlightColor': '#381730',
        'linetooltrendline.color': '#3DAE9A',
        'linetooltrendline.linewidth': 10,
      },
      overrides,
      loading_screen: {
        backgroundColor: '#220E1D',
        foregroundColor: 'rgba(255, 255, 255, 0.3)',
      },
      theme: 'dark',
    }

    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(() => {
      widgetRef.current = tvWidget
    })

    return () => {
      tvWidget.remove()
    }
  }, [dataFeed, defaultSymbol])

  useEffect(() => {
    if (widgetRef?.current) {
      widgetRef.current.setSymbol(
        `${props.sellAsset.denom}${PAIR_SEPARATOR}${props.buyAsset.denom}`,
        widgetRef.current.chart().resolution() || ('1h' as ResolutionString),
        () => {},
      )
    }
  }, [props.buyAsset.denom, props.sellAsset.denom])

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
      contentClassName='px-0.5 pb-0.5 h-full'
      className='h-[70dvh] max-h-[980px] min-h-[560px]'
    >
      <div ref={chartContainerRef} className='h-full overflow-hidden rounded-b-base' />
    </Card>
  )
}
