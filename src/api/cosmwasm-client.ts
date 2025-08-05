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
    console.error(`Error creating managed vault query client for ${address}:`, error)
    throw error
  }
}

const getManagedVaultOwnerAddress = async (chainConfig: ChainConfig, address: string) => {
  try {
    const client = await getClient(getUrl(chainConfig.endpoints.rpc))
    const contractInfo = await client.getContract(address)
    return contractInfo.creator
  } catch (error) {
    console.error(`Error fetching owner address for vault ${address}:`, error)
    return undefined
  }
}

const getManagedVaultDetails = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
): Promise<ManagedVaultSCDetailsResponse | null> => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.vaultExtension({
      vault_info: {},
    })
    return response as unknown as ManagedVaultSCDetailsResponse
  } catch (error) {
    console.error(`Error fetching details for vault ${vaultAddress}:`, error)
    return null
  }
}

const getManagedVaultPnl = async (chainConfig: ChainConfig, vaultAddress: string) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.vaultExtension({
      vault_pnl: {},
    })
    return response as unknown as ManagedVaultPnlResponse
  } catch (error) {
    console.error(`Error fetching PnL for vault ${vaultAddress}:`, error)
    return null
  }
}

const getManagedVaultUserPosition = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
  userAddress: string,
) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.vaultExtension({
      user_pnl: {
        user_address: userAddress,
      },
    })
    return response as unknown as ManagedVaultUserPositionResponse
  } catch (error) {
    console.error(`Error fetching user position for vault ${vaultAddress}:`, error)
    return null
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
    console.error(`Error fetching performance fee state for vault ${vaultAddress}:`, error)
    return null
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
    return response as unknown as UserManagedVaultUnlockResponse[]
  } catch (error) {
    console.error(`Error fetching user unlocks for vault ${vaultAddress}:`, error)
    return []
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
      data: UserManagedVaultUnlockResponse[]
      metadata: { has_more: boolean }
    }
  } catch (error) {
    console.error(`Error fetching all unlocks for vault ${vaultAddress}:`, error)
    return { data: [], metadata: { has_more: false } }
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
    console.error(`Error fetching preview redeem for vault ${vaultAddress}:`, error)
    return null
  }
}

const getManagedVaultConvertToTokens = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
  amount: string,
) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.convertToAssets({
      amount,
    })
    return response
  } catch (error) {
    console.error(`Error fetching convert to tokens for vault ${vaultAddress}:`, error)
    return null
  }
}

const getManagedVaultConvertToShares = async (
  chainConfig: ChainConfig,
  vaultAddress: string,
  amount: string,
) => {
  try {
    const client = await getManagedVaultQueryClient(chainConfig, vaultAddress)
    const response = await client.convertToShares({
      amount,
    })
    return response
  } catch (error) {
    console.error(`Error fetching convert to shares for vault ${vaultAddress}:`, error)
    return null
  }
}

export {
  getClient,
  getCreditManagerQueryClient,
  getIncentivesQueryClient,
  getManagedVaultAllUnlocks,
  getManagedVaultDetails,
  getManagedVaultPnl,
  getManagedVaultUserPosition,
  getManagedVaultOwnerAddress,
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
  getManagedVaultConvertToTokens,
  getManagedVaultConvertToShares,
}
