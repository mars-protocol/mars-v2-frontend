import { ChartingLibraryFeatureset } from 'utils/charting_library/charting_library'

export const disabledFeatures: ChartingLibraryFeatureset[] = [
  'timeframes_toolbar',
  'go_to_date',
  'header_compare',
  'header_saveload',
  'popup_hints',
  'header_symbol_search',
  'symbol_info',
  'horz_touch_drag_scroll',
  'vert_touch_drag_scroll',
  'main_series_scale_menu',
  'symbol_info',
]

export const enabledFeatures: ChartingLibraryFeatureset[] = [
  'timezone_menu',
  'header_settings',
  'use_localstorage_for_settings',
  'chart_zoom',
]

export const disabledFeaturesMobile: ChartingLibraryFeatureset[] = [
  'timeframes_toolbar',
  'go_to_date',
  'header_compare',
  'header_saveload',
  'popup_hints',
  'header_symbol_search',
  'symbol_info',
  'timezone_menu',
  'main_series_scale_menu',
  'symbol_info',
  'show_zoom_and_move_buttons_on_touch',
]

export const enabledFeaturesMobile: ChartingLibraryFeatureset[] = [
  'horz_touch_drag_scroll',
  'vert_touch_drag_scroll',
  'use_localstorage_for_settings',
  'chart_zoom',
  'hide_left_toolbar_by_default',
]
