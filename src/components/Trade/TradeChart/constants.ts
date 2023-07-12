import {
  ChartingLibraryFeatureset,
  LibrarySymbolInfo,
  ResolutionString,
  SeriesFormat,
  Timezone,
} from 'utils/charting_library/charting_library'

export const disabledFeatures: ChartingLibraryFeatureset[] = [
  'timeframes_toolbar',
  'go_to_date',
  'header_compare',
  'header_saveload',
  'popup_hints',
  'header_symbol_search',
  'symbol_info',
]

export const enabledFeatures: ChartingLibraryFeatureset[] = [
  'timezone_menu',
  'header_settings',
  'use_localstorage_for_settings',
]

export const settingsOverrides = {
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
}

export const overrides = {
  'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.8)',
  'linetooltrendline.linewidth': 2,
}

export const defaultSymbolInfo: LibrarySymbolInfo = {
  currency_code: '',
  original_currency_code: '',
  full_name: '',
  description: '',
  ticker: '',
  name: 'Osmosis',
  exchange: 'Osmosis',
  listed_exchange: 'Osmosis',
  type: 'AMM',
  session: '24x7',
  minmov: 1,
  pricescale: 100000,
  timezone: 'Etc/UTC' as Timezone,
  has_intraday: true,
  has_daily: true,
  has_weekly_and_monthly: true,
  format: 'price' as SeriesFormat,
  supported_resolutions: ['15'] as ResolutionString[],
}
