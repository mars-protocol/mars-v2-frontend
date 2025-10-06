export function getTradingViewSettings(theme: string): TradingViewSettings {
  switch (theme) {
    case 'dark':
      return {
        theme: 'dark',
        backgroundColor: '#121216',
        stylesheet: '/tradingview.css',
        overrides: {
          'paneProperties.background': '#141518',
          'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.4)',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.fontSize': 12,
          'scalesProperties.textColor': 'rgba(255, 255, 255, 0.6)',
          'paneProperties.gridProperties.color': 'rgba(255, 255, 255, 0.05)',
          'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.05)',
          'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.05)',
          'scalesProperties.lineColor': 'rgba(255, 255, 255, 0.3)',
        },
        loadingScreen: {
          backgroundColor: '#141518',
          foregroundColor: '#FFFFFF',
        },
        chartStyle: {
          upColor: '#3DAE9A',
          downColor: '#AE3D3D',
          borderColor: '#141518',
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
          'scalesProperties.textColor': 'rgba(0, 0, 0, 0.6)',
          'paneProperties.gridProperties.color': 'rgba(0, 0, 0, 0.05)',
          'paneProperties.vertGridProperties.color': 'rgba(0, 0, 0, 0.05)',
          'paneProperties.horzGridProperties.color': 'rgba(0, 0, 0, 0.05)',
          'scalesProperties.lineColor': 'rgba(0, 0, 0, 0.3)',
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
        backgroundColor: '#121216',
        stylesheet: '/tradingview_default.css',
        overrides: {
          'paneProperties.background': '#141518',
          'linetooltrendline.linecolor': 'rgba(255, 255, 255, 0.8)',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.fontSize': 12,
          'scalesProperties.textColor': 'rgba(255, 255, 255, 0.6)',
          'paneProperties.gridProperties.color': 'rgba(255, 255, 255, 0.05)',
          'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.05)',
          'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.05)',
          'scalesProperties.lineColor': 'rgba(255, 255, 255, 0.3)',
        },
        loadingScreen: {
          backgroundColor: '#141518',
          foregroundColor: 'rgba(255, 255, 255, 0.6)',
        },
        chartStyle: {
          upColor: '#3DAE9A',
          downColor: '#AE3D3D',
          borderColor: '#141518',
          borderUpColor: '#3DAE9A',
          borderDownColor: '#AE3D3D',
          wickUpColor: '#3DAE9A',
          wickDownColor: '#AE3D3D',
        },
      }
  }
}
