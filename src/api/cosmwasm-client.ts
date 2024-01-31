import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { MarsCreditManagerQueryClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsIncentivesQueryClient } from 'types/generated/mars-incentives/MarsIncentives.client'
import { MarsMockVaultQueryClient } from 'types/generated/mars-mock-vault/MarsMockVault.client'
import { MarsOracleOsmosisQueryClient } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.client'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'
import { MarsPerpsQueryClient } from 'types/generated/mars-perps/MarsPerps.client'
import { MarsSwapperOsmosisQueryClient } from 'types/generated/mars-swapper-osmosis/MarsSwapperOsmosis.client'

let _cosmWasmClient: Map<string, CosmWasmClient> = new Map()
let _creditManagerQueryClient: Map<string, MarsCreditManagerQueryClient> = new Map()
let _oracleQueryClient: Map<string, MarsOracleOsmosisQueryClient> = new Map()
let _paramsQueryClient: Map<string, MarsParamsQueryClient> = new Map()
let _incentivesQueryClient: Map<string, MarsIncentivesQueryClient> = new Map()
let _swapperOsmosisClient: Map<string, MarsSwapperOsmosisQueryClient> = new Map()
let _perpsClient: Map<string, MarsPerpsQueryClient> = new Map()

const getClient = async (rpc: string) => {
  try {
    if (!_cosmWasmClient.get(rpc)) {
      const client = await CosmWasmClient.connect(rpc)
      _cosmWasmClient.set(rpc, client)
    }

    return _cosmWasmClient.get(rpc)!
  } catch (error) {
    throw error
  }
}

const getCreditManagerQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.creditManager
    const rpc = chainConfig.endpoints.rpc
    const key = rpc + contract

    if (!_creditManagerQueryClient.get(key)) {
      const client = await getClient(rpc)
      _creditManagerQueryClient.set(key, new MarsCreditManagerQueryClient(client, contract))
    }

    return _creditManagerQueryClient.get(key)!
  } catch (error) {
    throw error
  }
}

const getParamsQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.params
    const rpc = chainConfig.endpoints.rpc
    const key = rpc + contract

    if (!_paramsQueryClient.get(key)) {
      const client = await getClient(rpc)
      _paramsQueryClient.set(key, new MarsParamsQueryClient(client, contract))
    }

    return _paramsQueryClient.get(key)!
  } catch (error) {
    throw error
  }
}

const getOracleQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.oracle
    const rpc = chainConfig.endpoints.rpc
    const key = rpc + contract

    if (!_oracleQueryClient.get(key)) {
      const client = await getClient(rpc)
      _oracleQueryClient.set(key, new MarsOracleOsmosisQueryClient(client, contract))
    }

    return _oracleQueryClient.get(key)!
  } catch (error) {
    throw error
  }
}

const getVaultQueryClient = async (chainConfig: ChainConfig, address: string) => {
  try {
    const client = await getClient(chainConfig.endpoints.rpc)
    return new MarsMockVaultQueryClient(client, address)
  } catch (error) {
    throw error
  }
}

const getIncentivesQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.incentives
    const rpc = chainConfig.endpoints.rpc
    const key = rpc + contract
    if (!_incentivesQueryClient.get(key)) {
      const client = await getClient(rpc)
      _incentivesQueryClient.set(key, new MarsIncentivesQueryClient(client, contract))
    }

    return _incentivesQueryClient.get(key)!
  } catch (error) {
    throw error
  }
}

const getSwapperQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.swapper
    const rpc = chainConfig.endpoints.rpc
    const key = rpc + contract
    if (!_swapperOsmosisClient.get(key)) {
      const client = await getClient(rpc)
      _swapperOsmosisClient.set(key, new MarsSwapperOsmosisQueryClient(client, contract))
    }

    return _swapperOsmosisClient.get(key)!
  } catch (error) {
    throw error
  }
}

const getPerpsQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.perps
    const rpc = chainConfig.endpoints.rpc
    const key = rpc + contract
    if (!_perpsClient.get(key)) {
      const client = await getClient(rpc)
      _perpsClient.set(key, new MarsPerpsQueryClient(client, contract))
    }

    return _perpsClient.get(key)!
  } catch (error) {
    throw error
  }
}

export {
  getClient,
  getCreditManagerQueryClient,
  getIncentivesQueryClient,
  getOracleQueryClient,
  getParamsQueryClient,
  getSwapperQueryClient,
  getVaultQueryClient,
  getPerpsQueryClient,
}
