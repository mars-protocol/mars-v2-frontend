import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { TriggerOrderResponse } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default async function getAccountLimitOrders(
  chainConfig: ChainConfig,
  accountId?: string,
): Promise<TriggerOrderResponse[]> {
  if (!accountId) return []
  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

  const triggerOrders = await creditManagerQueryClient.allAccountTriggerOrders({ accountId })

  if (triggerOrders.data.length === 0) return []

  return triggerOrders.data
}
