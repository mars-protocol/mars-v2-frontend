import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { ENV } from 'constants/env'
import { MarsAccountNftQueryClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerQueryClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsMockOracleQueryClient } from 'types/generated/mars-mock-oracle/MarsMockOracle.client'
import { MarsMockRedBankQueryClient } from 'types/generated/mars-mock-red-bank/MarsMockRedBank.client'
import { MarsMockVaultQueryClient } from 'types/generated/mars-mock-vault/MarsMockVault.client'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'

let _cosmWasmClient: CosmWasmClient
let _accountNftQueryClient: MarsAccountNftQueryClient
let _creditManagerQueryClient: MarsCreditManagerQueryClient
let _oracleQueryClient: MarsMockOracleQueryClient
let _redBankQueryClient: MarsMockRedBankQueryClient
let _paramsQueryClient: MarsParamsQueryClient

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

const getAccountNftQueryClient = async () => {
  try {
    if (!_accountNftQueryClient) {
      const client = await getClient()
      _accountNftQueryClient = new MarsAccountNftQueryClient(client, ENV.ADDRESS_ACCOUNT_NFT)
    }

    return _accountNftQueryClient
  } catch (error) {
    throw error
  }
}

const getCreditManagerQueryClient = async () => {
  try {
    if (!_creditManagerQueryClient) {
      const client = await getClient()
      _creditManagerQueryClient = new MarsCreditManagerQueryClient(
        client,
        ENV.ADDRESS_CREDIT_MANAGER,
      )
    }

    return _creditManagerQueryClient
  } catch (error) {
    throw error
  }
}

const getParamsQueryClient = async () => {
  try {
    if (!_paramsQueryClient) {
      const client = await getClient()
      _paramsQueryClient = new MarsParamsQueryClient(client, ENV.ADDRESS_PARAMS)
    }

    return _paramsQueryClient
  } catch (error) {
    throw error
  }
}

const getOracleQueryClient = async () => {
  try {
    if (!_oracleQueryClient) {
      const client = await getClient()
      _oracleQueryClient = new MarsMockOracleQueryClient(client, ENV.ADDRESS_ORACLE)
    }

    return _oracleQueryClient
  } catch (error) {
    throw error
  }
}

const getRedBankQueryClient = async () => {
  try {
    if (!_redBankQueryClient) {
      const client = await getClient()
      _redBankQueryClient = new MarsMockRedBankQueryClient(client, ENV.ADDRESS_RED_BANK)
    }

    return _redBankQueryClient
  } catch (error) {
    throw error
  }
}

const getVaultQueryClient = async (address: string) => {
  try {
    const client = await getClient()
    return new MarsMockVaultQueryClient(client, address)
  } catch (error) {
    throw error
  }
}

export {
  getClient,
  getAccountNftQueryClient,
  getCreditManagerQueryClient,
  getParamsQueryClient,
  getOracleQueryClient,
  getRedBankQueryClient,
  getVaultQueryClient,
}
