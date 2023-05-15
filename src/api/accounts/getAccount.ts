import { getClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'

export default async function getAccount(accountId: string): Promise<AccountResponse> {
  const client = await getClient()

  const account: AccountResponse = await client.queryContractSmart(ENV.ADDRESS_CREDIT_MANAGER, {
    positions: {
      account_id: accountId,
    },
  })

  if (account) {
    return account
  }

  return new Promise((_, reject) => reject('No account found'))
}
