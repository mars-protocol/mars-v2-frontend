import { getClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'

export default async function getAccountIds(address: string) {
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
