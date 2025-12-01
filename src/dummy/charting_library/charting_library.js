!(function (e, t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? t(exports)
    : 'function' == typeof define && define.amd
      ? define(['exports'], t)
      : t(((e = 'undefined' != typeof globalThis ? globalThis : e || self).TradingView = {}))
})(this, function (e) {
  'use strict'
  function t() {
    return 'CL v27.001 (internal id 3eb6c0e5 @ 2024-02-02T14:43:45.314Z)'
  }
  ;('undefined' != typeof window &&
    ((window.TradingView = window.TradingView || {}), (window.TradingView.version = t)),
    'undefined' != typeof window &&
      window.navigator &&
      window.navigator.userAgent &&
      window.navigator.userAgent.includes('CriOS'),
    (e.version = t),
    (e.widget = class {
      constructor(e) {
        return
      }
      setDebugMode(e) {}
      onChartReady(e) {}
      headerReady() {}
      onGrayedObjectClicked(e) {}
      onShortcut(e, t) {}
      subscribe(e, t) {}
      unsubscribe(e, t) {}
      chart(e) {}
      getLanguage() {}
      setSymbol(e, t, n) {}
      remove() {}
      closePopupsAndDialogs() {}
      selectLineTool(e, t) {}
      selectedLineTool() {}
      save(e, t) {}
      load(e, t) {}
      getSavedCharts(e) {}
      loadChartFromServer(e) {}
      saveChartToServer(e, t, n) {}
      removeChartFromServer(e, t) {}
      onContextMenu(e) {}
      createButton(e) {}
      createDropdown(e) {}
      showNoticeDialog(e) {}
      showConfirmDialog(e) {}
      showLoadChartDialog() {}
      showSaveAsChartDialog() {}
      symbolInterval() {}
      mainSeriesPriceFormatter() {}
      getIntervals() {}
      getStudiesList() {}
      getStudyInputs(e) {}
      getStudyStyles(e) {}
      addCustomCSSFile(e) {}
      applyOverrides(e) {}
      applyStudiesOverrides(e) {}
      watchList() {}
      news() {}
      widgetbar() {}
      activeChart() {}
      activeChartIndex() {}
      setActiveChart(e) {}
      chartsCount() {}
      layout() {}
      setLayout(e) {}
      layoutName() {}
      changeTheme(e, t) {}
      getTheme() {}
      takeScreenshot() {}
      lockAllDrawingTools() {}
      hideAllDrawingTools() {}
      drawOnAllCharts(e) {}
      magnetEnabled() {}
      magnetMode() {}
      undoRedoState() {}
      setIntervalLinkingEnabled(e) {}
      setDateRangeLinkingEnabled(e) {}
      setTimeFrame(e) {}
      symbolSync() {}
      intervalSync() {}
      crosshairSync() {}
      timeSync() {}
      dateRangeSync() {}
      setFeatureEnabled(e, t) {}
      getAllFeatures() {}
      clearUndoHistory() {}
      undo() {}
      redo() {}
      startFullscreen() {}
      exitFullscreen() {}
      takeClientScreenshot(e) {}
      navigationButtonsVisibility() {}
      paneButtonsVisibility() {}
      dateFormat() {}
      timeHoursFormat() {}
      currencyAndUnitVisibility() {}
      supportedChartTypes() {}
      watermark() {}
      customSymbolStatus() {}
      setCSSCustomProperty(e, t) {}
      getCSSCustomPropertyValue(e) {}
      linking() {}
      _innerAPI() {}
      _innerWindow() {}
      _doWhenInnerWindowLoaded(e) {}
      _doWhenInnerApiLoaded(e) {}
      _autoResizeChart() {}
      _create() {}
      _render(e) {}
    }),
    Object.defineProperty(e, '__esModule', { value: !0 }))
})
