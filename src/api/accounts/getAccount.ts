import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'types/classes/BNCoin'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { resolvePositionResponse } from 'utils/resolvers'

export default async function getAccount(accountId: string): Promise<Account> {
  const creditManagerQueryClient = await getCreditManagerQueryClient()

  const accountPosition: Positions = await creditManagerQueryClient.positions({ accountId })

  if (accountPosition) {
    return resolvePositionResponse(accountPosition)
  }

  return new Promise((_, reject) => reject('No account found'))
}
