'use strict'
function o() {
  return 'CL v27.001 (internal id 3eb6c0e5 @ 2024-02-02T14:43:45.314Z)'
}
const s = class {
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
  setSymbol(e, t, a) {}
  remove() {}
  closePopupsAndDialogs() {}
  selectLineTool(e, t) {}
  selectedLineTool() {}
  save(e, t) {}
  load(e, t) {}
  getSavedCharts(e) {}
  loadChartFromServer(e) {}
  saveChartToServer(e, t, a) {}
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
}
'undefined' != typeof window &&
  ((window.TradingView = window.TradingView || {}), (window.TradingView.version = o))
const r =
  !('undefined' == typeof window || !window.navigator || !window.navigator.userAgent) &&
  window.navigator.userAgent.includes('CriOS')
;((exports.version = o), (exports.widget = s))
