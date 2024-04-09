import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { ArrayOfTriggerOrder } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default async function getLimitOrders(
  chainConfig: ChainConfig,
): Promise<ArrayOfTriggerOrder> {
  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

  const triggerOrders = await creditManagerQueryClient.allTriggerOrders({})

  if (triggerOrders.length === 0) return []

  return triggerOrders
}
