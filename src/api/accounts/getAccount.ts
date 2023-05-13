import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'

export default async function getAccount(accountId: string): Promise<AccountResponse> {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

  const client = await CosmWasmClient.connect(ENV.URL_RPC)

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
