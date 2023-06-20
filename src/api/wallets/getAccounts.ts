import { resolvePositionResponses } from 'utils/resolvers'
import getWalletAccountIds from 'api/wallets/getAccountIds'
import { getCreditManagerQueryClient } from 'api/cosmwasm-client'

export default async function getAccounts(address: string): Promise<Account[]> {
  const accountIds: string[] = await getWalletAccountIds(address)
  const creditManagerQueryClient = await getCreditManagerQueryClient()

  const $accounts = accountIds.map((accountId) => creditManagerQueryClient.positions({ accountId }))

  const accounts = await Promise.all($accounts).then((accounts) => accounts)

  if (accounts) {
    return resolvePositionResponses(accounts)
  }

  return new Promise((_, reject) => reject('No data'))
}
