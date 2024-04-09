import { OrderType } from 'types/enums/orderType'

const ORDER_TYPE_UNAVAILABLE_MESSAGE =
  'This type of order is currently unavailable and is coming soon.'

export const TRADE_ORDER_TYPE_TABS: OrderTab[] = [
  { type: OrderType.MARKET, isDisabled: false, tooltipText: '' },
  {
    type: OrderType.LIMIT,
    isDisabled: true,
    tooltipText: ORDER_TYPE_UNAVAILABLE_MESSAGE,
  },
  {
    type: OrderType.STOP,
    isDisabled: true,
    tooltipText: ORDER_TYPE_UNAVAILABLE_MESSAGE,
  },
]
