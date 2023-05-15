import { getClient } from 'api/client'
import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'

export default async function getAccountIds(address: string) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_ACCOUNT_NFT) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

  const client = await getClient()

  const data = await client.queryContractSmart(ENV.ADDRESS_ACCOUNT_NFT, {
    tokens: {
      owner: address,
    },
  })

  if (data.tokens) {
    return data.tokens
  }

  return new Promise((_, reject) => reject('No data'))
}
