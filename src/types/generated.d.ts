type ActionCoin = import('types/generated/mars-credit-manager/MarsCreditManager.types').ActionCoin

type BNCoin = import('types/classes/BNCoin').BNCoin

type ArrayOfLimitOrders = LimitOrders[]
interface LimitOrders {
  account_id: string
  order_id: string
  order: { actions: Action[]; keeper_fee: Coin; triggers: Trigger[] }
}
