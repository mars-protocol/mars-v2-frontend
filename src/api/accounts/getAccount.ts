import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default async function getAccount(accountId: string): Promise<Positions> {
  const creditManagerQueryClient = await getCreditManagerQueryClient()

  const account = creditManagerQueryClient.positions({ accountId })

  if (account) {
    return account
  }

  return new Promise((_, reject) => reject('No account found'))
}
