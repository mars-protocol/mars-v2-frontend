import { useEffect, useMemo, useRef } from 'react'

import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  Timezone,
  widget,
} from 'utils/charting_library'
import Card from 'components/Card'
import {
  OsmosisTheGraphDataFeed,
  PAIR_SEPARATOR,
} from 'components/Trade/TradeChart/OsmosisTheGraphDataFeed'
import useStore from 'store'
import {
  disabledFeatures,
  enabledFeatures,
  overrides,
  settingsOverrides,
} from 'components/Trade/TradeChart/constants'

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
      settings_overrides: settingsOverrides,
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
    <Card title='Trading Chart' contentClassName='px-0.5 pb-0.5 h-full '>
      <div ref={chartContainerRef} className='h-full' />
    </Card>
  )
}
