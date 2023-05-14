import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { resolvePositionResponses } from 'utils/resolvers'

import getWalletAccountIds from './getWalletAccountIds'

export default async function getWalletAccounts(address: string): Promise<Account[]> {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER || !ENV.URL_API) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

  const accountIds: string[] = await getWalletAccountIds(address)

  const client = await CosmWasmClient.connect(ENV.URL_RPC)

  const $accounts: Promise<AccountResponse>[] = accountIds.map((accountId) =>
    client.queryContractSmart(ENV.ADDRESS_CREDIT_MANAGER!, {
      positions: {
        account_id: `${accountId}`,
      },
    }),
  )

  const accounts = await Promise.all($accounts).then((accounts) => accounts)

  if (accounts) {
    return resolvePositionResponses(accounts)
  }

  return new Promise((_, reject) => reject('No data'))
}
