const ORDER_TYPE_UNAVAILABLE_MESSAGE =
  'This type of order is currently unavailable and is coming soon.'

export const TRADE_ORDER_TYPE_TABS: OrderTab[] = [
  { type: 'Market', isDisabled: false, tooltipText: '' },
  {
    type: 'Limit',
    isDisabled: true,
    tooltipText: ORDER_TYPE_UNAVAILABLE_MESSAGE,
  },
  {
    type: 'Stop',
    isDisabled: true,
    tooltipText: ORDER_TYPE_UNAVAILABLE_MESSAGE,
  },
]
