import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { ENV } from 'constants/env'

let _cosmWasmClient: CosmWasmClient

const getClient = async () => {
  try {
    if (!_cosmWasmClient) {
      _cosmWasmClient = await CosmWasmClient.connect(ENV.URL_RPC)
    }

    return _cosmWasmClient
  } catch (error) {
    throw error
  }
}

export { getClient }
