import { useEffect, useMemo, useRef } from 'react'

import Card from 'components/Card'
import { disabledFeatures, enabledFeatures, overrides } from 'components/Trade/TradeChart/constants'
import {
  OsmosisTheGraphDataFeed,
  PAIR_SEPARATOR,
} from 'components/Trade/TradeChart/OsmosisTheGraphDataFeed'
import useStore from 'store'
import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  Timezone,
  widget,
} from 'utils/charting_library'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export const TVChartContainer = (props: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  const widgetRef = useRef<IChartingLibraryWidget>()
  const defaultSymbol = useRef<string>(
    `${props.buyAsset.mainnetDenom}${PAIR_SEPARATOR}${props.sellAsset.mainnetDenom}`,
  )
  const baseCurrency = useStore((s) => s.baseCurrency)
  const dataFeed = useMemo(
    () => new OsmosisTheGraphDataFeed(false, baseCurrency.decimals, baseCurrency.denom),
    [baseCurrency],
  )

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
        `${props.sellAsset.mainnetDenom}${PAIR_SEPARATOR}${props.buyAsset.mainnetDenom}`,
        widgetRef.current.chart().resolution() || ('1h' as ResolutionString),
        () => {},
      )
    }
  }, [props.buyAsset.mainnetDenom, props.sellAsset.mainnetDenom])

  return (
    <Card
      title={`Trading Chart - ${props.buyAsset.symbol}/${props.sellAsset.symbol}`}
      contentClassName='px-0.5 pb-0.5 h-full'
    >
      <div ref={chartContainerRef} className='h-full' />
    </Card>
  )
}
