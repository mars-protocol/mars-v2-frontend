import { create } from 'zustand'
import BigNumber from 'bignumber.js'
import { OrderType } from 'types/enums'

interface PerpsOrderFormState {
  limitPrice: BigNumber
  stopPrice: BigNumber
  orderType: 'market' | 'limit' | 'stop'
  selectedOrderType: OrderType
  setLimitPrice: (price: BigNumber, fromTradingView?: boolean) => void
  setStopPrice: (price: BigNumber, fromTradingView?: boolean) => void
  setOrderType: (type: 'market' | 'limit' | 'stop') => void
  setSelectedOrderType: (type: OrderType) => void
}

interface PerpsOrderFormState {
  limitPrice: BigNumber
  stopPrice: BigNumber
  orderType: 'market' | 'limit' | 'stop'
  selectedOrderType: OrderType
  setLimitPrice: (price: BigNumber, fromTradingView?: boolean) => void
  setStopPrice: (price: BigNumber, fromTradingView?: boolean) => void
  setOrderType: (type: 'market' | 'limit' | 'stop') => void
  setSelectedOrderType: (type: OrderType) => void
}

export const usePerpsOrderForm = create<PerpsOrderFormState>((set) => ({
  limitPrice: new BigNumber(0),
  stopPrice: new BigNumber(0),
  orderType: 'market',
  selectedOrderType: OrderType.MARKET,
  setLimitPrice: (price, fromTradingView = false) => {
    if (fromTradingView) {
      set({
        limitPrice: price,
        orderType: 'limit',
        selectedOrderType: OrderType.LIMIT,
      })
    } else {
      set({
        limitPrice: price,
      })
    }
  },
  setStopPrice: (price, fromTradingView = false) => {
    if (fromTradingView) {
      set({
        stopPrice: price,
        orderType: 'stop',
        selectedOrderType: OrderType.STOP,
      })
    } else {
      set({
        stopPrice: price,
      })
    }
  },
  setOrderType: (type) => set({ orderType: type }),
  setSelectedOrderType: (type) => {
    set((state) => ({
      selectedOrderType: type,
      orderType: type === OrderType.MARKET ? 'market' : type === OrderType.LIMIT ? 'limit' : 'stop',
      ...(type === OrderType.MARKET
        ? {
            limitPrice: new BigNumber(0),
            stopPrice: new BigNumber(0),
          }
        : {}),
    }))
  },
}))
