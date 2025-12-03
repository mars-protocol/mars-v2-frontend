!(function (e, s) {
  'object' == typeof exports && 'undefined' != typeof module
    ? s(exports)
    : 'function' == typeof define && define.amd
      ? define(['exports'], s)
      : s(((e = 'undefined' != typeof globalThis ? globalThis : e || self).Datafeeds = {}))
})(this, function (e) {
  'use strict'
  function s(e) {
    return void 0 === e ? '' : 'string' == typeof e ? e : e.message
  }
  class t {
    constructor(e, s, t) {
      return
    }
    getBars(e, s, t) {}
    async _processTruncatedResponse(e, s) {}
    _processHistoryResponse(e) {}
  }
  class r {
    constructor(e, s) {
      return
    }
    subscribeBars(e, s, t, r) {}
    unsubscribeBars(e) {}
    _updateData() {}
    _updateDataForSubscriber(e) {}
    _onSubscriberDataReceived(e, s) {}
  }
  class o {
    constructor(e) {
      return
    }
    subscribeQuotes(e, s, t, r) {}
    unsubscribeQuotes(e) {}
    _createTimersIfRequired() {}
    _destroyTimers() {}
    _updateQuotes(e) {}
  }
  function u(e, s, t, r) {}
  function n(e, s, t) {}
  class c {
    constructor(e, s, t) {
      return
    }
    resolveSymbol(e, s, t) {}
    searchSymbols(e, s, t, r) {}
    _init() {}
    _requestExchangeData(e) {}
    _onExchangeDataReceived(e, s) {}
  }
  function a(e, s) {}
  function i(e, s, t) {}
  class b {
    constructor(e, s, t, r = 1e4, o) {
      return
    }
    onReady(e) {}
    getQuotes(e, s, t) {}
    subscribeQuotes(e, s, t, r) {}
    unsubscribeQuotes(e) {}
    getMarks(e, s, t, r, o) {}
    getTimescaleMarks(e, s, t, r, o) {}
    getServerTime(e) {}
    searchSymbols(e, s, t, r) {}
    resolveSymbol(e, s, t, r) {}
    getBars(e, s, t, r, o) {}
    subscribeBars(e, s, t, r, o) {}
    unsubscribeBars(e) {}
    _requestConfiguration() {}
    _send(e, s) {}
    _setupWithConfiguration(e) {}
  }
  ;((e.UDFCompatibleDatafeed = class extends b {
    constructor(e, s = 1e4, t) {
      let r = new (class e {
        constructor(e) {
          return
        }
        sendRequest(e, s, t) {}
      })()
      super(
        e,
        new (class e {
          constructor(e, s) {
            return
          }
          getQuotes(e) {}
        })(e, r),
        r,
        s,
        t,
      )
    }
  }),
    Object.defineProperty(e, '__esModule', { value: !0 }))
})
