import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { ArrayOfPerpLimitOrder } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default async function getAccountLimitOrders(
  chainConfig: ChainConfig,
  accountId?: string,
): Promise<ArrayOfPerpLimitOrder> {
  if (!accountId) return []
  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

  const triggerOrders = await creditManagerQueryClient.allAccountTriggerOrders({ accountId })

  if (triggerOrders.length === 0) return []

  return triggerOrders
}
