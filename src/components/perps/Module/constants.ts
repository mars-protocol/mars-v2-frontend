import { CalloutType } from 'components/common/Callout'
import { OrderType } from 'types/enums'

const ORDER_TYPE_UNAVAILABLE_MESSAGE = 'This type of order is coming soon.'

export const PERPS_ORDER_TYPE_TABS: OrderTab[] = [
  { type: OrderType.MARKET, isDisabled: false },
  {
    type: OrderType.LIMIT,
    isDisabled: false,
  },
]

export const DEFAULT_LIMIT_PRICE_INFO: CallOut = {
  message:
    'In order to create a limit order please specify a price. As soon as the price is hit, the transaction will be executed.',
  type: CalloutType.INFO,
}
