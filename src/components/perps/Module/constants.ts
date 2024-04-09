import { CalloutType } from 'types/enums/callOut'

const ORDER_TYPE_UNAVAILABLE_MESSAGE = 'This type of order is coming soon.'

export const PERPS_ORDER_TYPE_TABS: OrderTab[] = [
  { type: 'Market', isDisabled: false },
  {
    type: 'Limit',
    isDisabled: false,
  },
  {
    type: 'Stop',
    isDisabled: true,
    tooltipText: ORDER_TYPE_UNAVAILABLE_MESSAGE,
  },
]

export const DEFAULT_LIMIT_PRICE_INFO: CallOut = {
  message:
    'In order to create a limit order, please specify a price greater than the current price of the selected asset.',
  type: CalloutType.INFO,
}
