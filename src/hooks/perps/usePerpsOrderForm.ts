import { create } from 'zustand'
import BigNumber from 'bignumber.js'
import { OrderType } from 'types/enums'

interface PerpsOrderFormState {
  limitPrice: BigNumber
  orderType: 'market' | 'limit' | 'stop'
  selectedOrderType: OrderType
  setLimitPrice: (price: BigNumber, fromTradingView?: boolean) => void
  setOrderType: (type: 'market' | 'limit') => void
  setSelectedOrderType: (type: OrderType) => void
}

export const usePerpsOrderForm = create<PerpsOrderFormState>((set) => ({
  limitPrice: new BigNumber(0),
  orderType: 'market',
  selectedOrderType: OrderType.MARKET,
  setLimitPrice: (price, fromTradingView = false) => {
    if (fromTradingView) {
      set({
        limitPrice: price,
        ...(fromTradingView
          ? {
              orderType: 'limit',
              selectedOrderType: OrderType.LIMIT,
            }
          : {}),
      })
    } else {
      set({
        limitPrice: price,
      })
    }
  },
  setOrderType: (type) => set({ orderType: type }),
  setSelectedOrderType: (type) => {
    set((state) => ({
      selectedOrderType: type,
      orderType: type === OrderType.MARKET ? 'market' : 'limit',
      ...(type === OrderType.MARKET ? { limitPrice: new BigNumber(0) } : {}),
    }))
  },
}))
