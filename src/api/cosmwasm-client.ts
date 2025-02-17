import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { MarsCreditManagerQueryClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsIncentivesQueryClient } from 'types/generated/mars-incentives/MarsIncentives.client'
import { MarsMockVaultQueryClient } from 'types/generated/mars-mock-vault/MarsMockVault.client'
import { MarsOracleOsmosisQueryClient } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.client'
import { MarsOracleWasmQueryClient } from 'types/generated/mars-oracle-wasm/MarsOracleWasm.client'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'
import { MarsPerpsQueryClient } from 'types/generated/mars-perps/MarsPerps.client'
import { MarsRedBankQueryClient } from 'types/generated/mars-red-bank/MarsRedBank.client'
import { MarsVaultQueryClient } from 'types/generated/mars-vault/MarsVault.client'
import { setNodeError } from 'utils/error'
import { getUrl } from 'utils/url'

const _cosmWasmClient: Map<string, CosmWasmClient> = new Map()
const _creditManagerQueryClient: Map<string, MarsCreditManagerQueryClient> = new Map()
const _oracleQueryClient: Map<string, MarsOracleOsmosisQueryClient> = new Map()
const _paramsQueryClient: Map<string, MarsParamsQueryClient> = new Map()
const _incentivesQueryClient: Map<string, MarsIncentivesQueryClient> = new Map()
const _perpsClient: Map<string, MarsPerpsQueryClient> = new Map()
const _redBankQueryClient: Map<string, MarsRedBankQueryClient> = new Map()
const _managedVaultQueryClient: Map<string, MarsVaultQueryClient> = new Map()

const getClient = async (rpc: string) => {
  try {
    if (!_cosmWasmClient.get(rpc)) {
      const client = await CosmWasmClient.connect(rpc)
      _cosmWasmClient.set(rpc, client)
    }

    return _cosmWasmClient.get(rpc)!
  } catch (error) {
    setNodeError(rpc, error)
    throw error
  }
}

const getCreditManagerQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.creditManager
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + contract

    if (!_creditManagerQueryClient.get(key)) {
      const client = await getClient(rpc)
      _creditManagerQueryClient.set(key, new MarsCreditManagerQueryClient(client, contract))
    }

    return _creditManagerQueryClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getParamsQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.params
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + contract

    if (!_paramsQueryClient.get(key) && contract) {
      const client = await getClient(rpc)
      _paramsQueryClient.set(key, new MarsParamsQueryClient(client, contract))
    }

    return _paramsQueryClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getOracleQueryClientOsmosis = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.oracle
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + contract

    if (!_oracleQueryClient.get(key) && contract) {
      const client = await getClient(rpc)
      _oracleQueryClient.set(key, new MarsOracleOsmosisQueryClient(client, contract))
    }

    return _oracleQueryClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getOracleQueryClientNeutron = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.oracle
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + contract

    if (!_oracleQueryClient.get(key) && contract) {
      const client = await getClient(rpc)
      _oracleQueryClient.set(key, new MarsOracleWasmQueryClient(client, contract))
    }

    return _oracleQueryClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getVaultQueryClient = async (chainConfig: ChainConfig, address: string) => {
  try {
    const client = await getClient(getUrl(chainConfig.endpoints.rpc))
    return new MarsMockVaultQueryClient(client, address)
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getIncentivesQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.incentives
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + contract
    if (!_incentivesQueryClient.get(key) && contract) {
      const client = await getClient(rpc)
      _incentivesQueryClient.set(key, new MarsIncentivesQueryClient(client, contract))
    }

    return _incentivesQueryClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getPerpsQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.perps
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + contract
    if (!_perpsClient.get(key) && contract) {
      const client = await getClient(rpc)
      _perpsClient.set(key, new MarsPerpsQueryClient(client, contract))
    }

    return _perpsClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getRedBankQueryClient = async (chainConfig: ChainConfig) => {
  try {
    const contract = chainConfig.contracts.redBank
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + contract

    if (!_redBankQueryClient.get(key) && contract) {
      const client = await getClient(rpc)
      _redBankQueryClient.set(key, new MarsRedBankQueryClient(client, contract))
    }

    return _redBankQueryClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getManagedVaultQueryClient = async (chainConfig: ChainConfig, address: string) => {
  try {
    const rpc = getUrl(chainConfig.endpoints.rpc)
    const key = rpc + address

    if (!_managedVaultQueryClient.get(key)) {
      const client = await getClient(rpc)
      _managedVaultQueryClient.set(key, new MarsVaultQueryClient(client, address))
    }

    return _managedVaultQueryClient.get(key)!
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}
const getManagedVaultOwner = async (chainConfig: ChainConfig, address: string) => {
  try {
    const client = await getClient(getUrl(chainConfig.endpoints.rpc))
    const contractInfo = await client.getContract(address)
    return contractInfo.admin ?? contractInfo.creator
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getManagedVaultDetails = async (chainConfig: ChainConfig, vaultAddress: string) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.vaultExtension({
      vault_info: {},
    })
    return response as unknown as ManagedVaultDetails
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getManagedVaultPerformanceFeeState = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.vaultExtension({
      performance_fee_state: {},
    })
    return response as unknown as PerformanceFeeState
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getManagedVaultUserUnlocks = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
  userAddress: string,
) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.vaultExtension({
      user_unlocks: {
        user_address: userAddress,
      },
    })
    return response as unknown as UserManagedVaultUnlock[]
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getManagedVaultAllUnlocks = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
  limit?: number,
  startAfter?: [string, number] | null,
) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.vaultExtension({
      all_unlocks: {
        limit,
        start_after: startAfter,
      },
    })
    return response as unknown as {
      data: UserManagedVaultUnlock[]
      metadata: { has_more: boolean }
    }
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

const getManagedVaultPreviewRedeem = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
  amount: string,
) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.previewRedeem({
      amount,
    })
    return response
  } catch (error) {
    setNodeError(getUrl(chainConfig.endpoints.rpc), error)
    throw error
  }
}

export {
  getClient,
  getCreditManagerQueryClient,
  getIncentivesQueryClient,
  getManagedVaultAllUnlocks,
  getManagedVaultDetails,
  getManagedVaultOwner,
  getManagedVaultPerformanceFeeState,
  getManagedVaultQueryClient,
  getManagedVaultUserUnlocks,
  getOracleQueryClientNeutron,
  getOracleQueryClientOsmosis,
  getParamsQueryClient,
  getPerpsQueryClient,
  getRedBankQueryClient,
  getVaultQueryClient,
  getManagedVaultPreviewRedeem,
}
