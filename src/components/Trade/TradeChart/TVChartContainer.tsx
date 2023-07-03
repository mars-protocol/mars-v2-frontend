import { useEffect, useMemo, useRef } from 'react'

import {
  ChartingLibraryWidgetOptions,
  IBasicDataFeed,
  IChartingLibraryWidget,
  ResolutionString,
  Timezone,
  widget,
} from 'utils/charting_library'
import Card from 'components/Card'
import { OsmosisTheGraphDatafeed, PAIR_SEPARATOR } from 'components/Trade/TradeChart/datafeed'
import useStore from 'store'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export const TVChartContainer = (props: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  const widgetRef = useRef<IChartingLibraryWidget>()
  const defaultSymbol = useRef<string>(
    `${props.buyAsset.denom}${PAIR_SEPARATOR}${props.sellAsset.denom}`,
  )
  const baseCurrency = useStore((s) => s.baseCurrency)
  const datafeed = useMemo(
    () => new OsmosisTheGraphDatafeed(false, baseCurrency.decimals, baseCurrency.denom),
    [baseCurrency],
  )

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: defaultSymbol.current,
      datafeed: datafeed,
      interval: '1h' as ResolutionString,
      library_path: '/charting_library/',
      locale: 'en',
      time_scale: {
        min_bar_spacing: 12,
      },
      toolbar_bg: '#220E1D',
      disabled_features: [
        'timeframes_toolbar',
        'go_to_date',
        'header_compare',
        'header_saveload',
        'popup_hints',
        'header_symbol_search',
        'symbol_info',
      ],
      enabled_features: ['timezone_menu', 'header_settings', 'use_localstorage_for_settings'],
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
        'scalesProperties.textColor': 'rgba(255, 255, 255, 0.3)',
        'paneProperties.legendProperties.showSeriesTitle': false,
        'paneProperties.legendProperties.showVolume': false,
        'paneProperties.legendProperties.showStudyValues': false,
        'paneProperties.legendProperties.showStudyTitles': false,
        'scalesProperties.axisHighlightColor': '#381730',
        'linetooltrendline.color': 'rgba( 21, 153, 128, 1)',
        'linetooltrendline.linewidth': 10,
      },
      overrides: {
        'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.8)',
        'linetooltrendline.linewidth': 2,
      },
      loading_screen: {
        backgroundColor: '#220E1D',
        foregroundColor: 'rgba(255, 255, 255, 0.3)',
      },
      theme: 'Dark',
    }

    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(() => {
      widgetRef.current = tvWidget
    })

    return () => {
      tvWidget.remove()
    }
  }, [datafeed, defaultSymbol])

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
    <Card title='Trading Chart' contentClassName='px-0.5 pb-0.5 h-full'>
      <div ref={chartContainerRef} className='h-full' />
    </Card>
  )
}
