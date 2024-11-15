import { ChartingLibraryFeatureset } from 'utils/charting_library/charting_library'

export const disabledFeatures: ChartingLibraryFeatureset[] = [
  'timeframes_toolbar',
  'go_to_date',
  'header_compare',
  'header_saveload',
  'popup_hints',
  'header_symbol_search',
  'symbol_info',
  'main_series_scale_menu',
  'symbol_info',
  'header_symbol_search',
  'header_compare',
  'symbol_search_hot_key',
  'symbol_info',
  'go_to_date',
  'timeframes_toolbar',
  'create_volume_indicator_by_default',
]

export const enabledFeatures: ChartingLibraryFeatureset[] = [
  'timezone_menu',
  'header_settings',
  'use_localstorage_for_settings',
  'chart_zoom',
  'horz_touch_drag_scroll',
  'vert_touch_drag_scroll',
  'control_bar',
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
  'vert_touch_drag_scroll',
  'header_symbol_search',
  'header_compare',
  'symbol_search_hot_key',
  'symbol_info',
  'go_to_date',
  'timeframes_toolbar',
  'create_volume_indicator_by_default',
]

export const enabledFeaturesMobile: ChartingLibraryFeatureset[] = [
  'horz_touch_drag_scroll',
  'use_localstorage_for_settings',
  'chart_zoom',
  'hide_left_toolbar_by_default',
]
