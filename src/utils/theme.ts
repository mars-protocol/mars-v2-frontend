export function getTradingViewSettings(theme: string): TradingViewSettings {
  switch (theme) {
    case 'dark':
      return {
        theme: 'dark',
        backgroundColor: '#000000',
        stylesheet: '/tradingview.css',
        overrides: {
          'paneProperties.background': '#000000',
          'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.8)',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.fontSize': 12,
        },
        loadingScreen: {
          backgroundColor: '#000000',
          foregroundColor: '#FFFFFF',
        },
        chartStyle: {
          upColor: '#3DAE9A',
          downColor: '#AE3D3D',
          borderColor: '#000000',
          borderUpColor: '#3DAE9A',
          borderDownColor: '#AE3D3D',
          wickUpColor: '#3DAE9A',
          wickDownColor: '#AE3D3D',
        },
      }

    case 'light':
      return {
        theme: 'light',
        backgroundColor: '#FFFFFF',
        stylesheet: '/tradingview.css',
        overrides: {
          'paneProperties.background': '#FFFFFF',
          'linetooltrendline.linecolor': 'rgba(0, 0, 0, 0.3)',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.fontSize': 12,
        },
        loadingScreen: {
          backgroundColor: '#FFFFFF',
          foregroundColor: '#000000',
        },
        chartStyle: {
          upColor: '#3eb680',
          downColor: '#ff5252',
          borderColor: '#FFFFFF',
          borderUpColor: '#3eb680',
          borderDownColor: '#ff5252',
          wickUpColor: '#3eb680',
          wickDownColor: '#ff5252',
        },
      }

    default:
      return {
        theme: 'dark',
        backgroundColor: '#220E1D',
        stylesheet: '/tradingview_default.css',
        overrides: {
          'paneProperties.background': '#220E1D',
          'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.8)',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.fontSize': 12,
        },
        loadingScreen: {
          backgroundColor: '#220E1D',
          foregroundColor: 'rgba(255, 255, 255, 0.3)',
        },
        chartStyle: {
          upColor: '#3DAE9A',
          downColor: '#AE3D3D',
          borderColor: '#232834',
          borderUpColor: '#3DAE9A',
          borderDownColor: '#AE3D3D',
          wickUpColor: '#3DAE9A',
          wickDownColor: '#AE3D3D',
        },
      }
  }
}
