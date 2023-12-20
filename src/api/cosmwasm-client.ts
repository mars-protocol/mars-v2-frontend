import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import useStore from 'store'
import { ICNSQueryClient } from 'types/classes/ICNSClient.client'
import { MarsAccountNftQueryClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerQueryClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsIncentivesQueryClient } from 'types/generated/mars-incentives/MarsIncentives.client'
import { MarsMockVaultQueryClient } from 'types/generated/mars-mock-vault/MarsMockVault.client'
import { MarsOracleOsmosisQueryClient } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.client'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'
import { MarsRedBankQueryClient } from 'types/generated/mars-red-bank/MarsRedBank.client'
import { MarsSwapperOsmosisQueryClient } from 'types/generated/mars-swapper-osmosis/MarsSwapperOsmosis.client'

let _cosmWasmClient: Map<string, CosmWasmClient> = new Map()
let _accountNftQueryClient: MarsAccountNftQueryClient
let _creditManagerQueryClient: MarsCreditManagerQueryClient
let _oracleQueryClient: MarsOracleOsmosisQueryClient
let _redBankQueryClient: MarsRedBankQueryClient
let _paramsQueryClient: MarsParamsQueryClient
let _incentivesQueryClient: MarsIncentivesQueryClient
let _swapperOsmosisClient: MarsSwapperOsmosisQueryClient
let _ICNSQueryClient: ICNSQueryClient

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

const getAccountNftQueryClient = async (rpc: string) => {
  try {
    if (!_accountNftQueryClient) {
      const client = await getClient(rpc)
      _accountNftQueryClient = new MarsAccountNftQueryClient(
        client,
        // TODO: Replace with chainConfig
        useStore.getState().chainConfig.contracts.accountNft,
      )
    }

    return _accountNftQueryClient
  } catch (error) {
    throw error
  }
}

const getCreditManagerQueryClient = async (rpc: string) => {
  try {
    if (!_creditManagerQueryClient) {
      const client = await getClient(rpc)
      _creditManagerQueryClient = new MarsCreditManagerQueryClient(
        client,
        useStore.getState().chainConfig.contracts.creditManager,
      )
    }

    return _creditManagerQueryClient
  } catch (error) {
    throw error
  }
}

const getParamsQueryClient = async (rpc: string) => {
  try {
    if (!_paramsQueryClient) {
      const client = await getClient(rpc)
      _paramsQueryClient = new MarsParamsQueryClient(
        client,
        useStore.getState().chainConfig.contracts.params,
      )
    }

    return _paramsQueryClient
  } catch (error) {
    throw error
  }
}

const getOracleQueryClient = async (rpc: string) => {
  try {
    if (!_oracleQueryClient) {
      const client = await getClient(rpc)
      _oracleQueryClient = new MarsOracleOsmosisQueryClient(
        client,
        useStore.getState().chainConfig.contracts.oracle,
      )
    }

    return _oracleQueryClient
  } catch (error) {
    throw error
  }
}

const getRedBankQueryClient = async (rpc: string) => {
  try {
    if (!_redBankQueryClient) {
      const client = await getClient(rpc)
      _redBankQueryClient = new MarsRedBankQueryClient(
        client,
        useStore.getState().chainConfig.contracts.redBank,
      )
    }

    return _redBankQueryClient
  } catch (error) {
    throw error
  }
}

const getVaultQueryClient = async (rpc: string, address: string) => {
  try {
    const client = await getClient(rpc)
    return new MarsMockVaultQueryClient(client, address)
  } catch (error) {
    throw error
  }
}

const getIncentivesQueryClient = async (rpc: string) => {
  try {
    if (!_incentivesQueryClient) {
      const client = await getClient(rpc)
      _incentivesQueryClient = new MarsIncentivesQueryClient(
        client,
        useStore.getState().chainConfig.contracts.incentives,
      )
    }

    return _incentivesQueryClient
  } catch (error) {
    throw error
  }
}

const getSwapperQueryClient = async (rpc: string) => {
  try {
    if (!_swapperOsmosisClient) {
      const client = await getClient(rpc)
      _swapperOsmosisClient = new MarsSwapperOsmosisQueryClient(
        client,
        useStore.getState().chainConfig.contracts.swapper,
      )
    }

    return _swapperOsmosisClient
  } catch (error) {
    throw error
  }
}

const getICNSQueryClient = async (rpc: string) => {
  try {
    if (!_ICNSQueryClient) {
      const client = await getClient(rpc)
      _ICNSQueryClient = new ICNSQueryClient(client)
    }

    return _ICNSQueryClient
  } catch (error) {
    throw error
  }
}

export {
  getAccountNftQueryClient,
  getClient,
  getCreditManagerQueryClient,
  getICNSQueryClient,
  getIncentivesQueryClient,
  getOracleQueryClient,
  getParamsQueryClient,
  getRedBankQueryClient,
  getSwapperQueryClient,
  getVaultQueryClient,
}
