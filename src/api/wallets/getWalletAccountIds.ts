import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'

export default async function getWalletAccountIds(address: string) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_ACCOUNT_NFT) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

  const client = await CosmWasmClient.connect(ENV.URL_RPC)

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
