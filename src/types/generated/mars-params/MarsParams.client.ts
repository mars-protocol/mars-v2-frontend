// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@1.10.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { StdFee } from '@cosmjs/amino'
import {
  InstantiateMsg,
  ExecuteMsg,
  OwnerUpdate,
  AssetParamsUpdate,
  Decimal,
  HlsAssetTypeForString,
  Uint128,
  VaultConfigUpdate,
  PerpParamsUpdate,
  EmergencyUpdate,
  CmEmergencyUpdate,
  RedBankEmergencyUpdate,
  PerpsEmergencyUpdate,
  AssetParamsBaseForString,
  CmSettingsForString,
  HlsParamsBaseForString,
  LiquidationBonus,
  RedBankSettings,
  VaultConfigBaseForString,
  Coin,
  PerpParams,
  QueryMsg,
  HlsAssetTypeForAddr,
  Addr,
  ArrayOfAssetParamsBaseForAddr,
  AssetParamsBaseForAddr,
  CmSettingsForAddr,
  HlsParamsBaseForAddr,
  ArrayOfPerpParams,
  PaginationResponseForTotalDepositResponse,
  TotalDepositResponse,
  Metadata,
  ArrayOfVaultConfigBaseForAddr,
  VaultConfigBaseForAddr,
  PaginationResponseForVaultConfigBaseForAddr,
  NullableAssetParamsBaseForAddr,
  ConfigResponse,
  OwnerResponse,
} from './MarsParams.types'
export interface MarsParamsReadOnlyInterface {
  contractAddress: string
  owner: () => Promise<OwnerResponse>
  config: () => Promise<ConfigResponse>
  assetParams: ({ denom }: { denom: string }) => Promise<NullableAssetParamsBaseForAddr>
  allAssetParams: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<ArrayOfAssetParamsBaseForAddr>
  vaultConfig: ({ address }: { address: string }) => Promise<VaultConfigBaseForAddr>
  allVaultConfigs: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<ArrayOfVaultConfigBaseForAddr>
  allVaultConfigsV2: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<PaginationResponseForVaultConfigBaseForAddr>
  perpParams: ({ denom }: { denom: string }) => Promise<PerpParams>
  allPerpParams: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<ArrayOfPerpParams>
  totalDeposit: ({ denom }: { denom: string }) => Promise<TotalDepositResponse>
  allTotalDepositsV2: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<PaginationResponseForTotalDepositResponse>
}
export class MarsParamsQueryClient implements MarsParamsReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string
  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.owner = this.owner.bind(this)
    this.config = this.config.bind(this)
    this.assetParams = this.assetParams.bind(this)
    this.allAssetParams = this.allAssetParams.bind(this)
    this.vaultConfig = this.vaultConfig.bind(this)
    this.allVaultConfigs = this.allVaultConfigs.bind(this)
    this.allVaultConfigsV2 = this.allVaultConfigsV2.bind(this)
    this.perpParams = this.perpParams.bind(this)
    this.allPerpParams = this.allPerpParams.bind(this)
    this.totalDeposit = this.totalDeposit.bind(this)
    this.allTotalDepositsV2 = this.allTotalDepositsV2.bind(this)
  }
  owner = async (): Promise<OwnerResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      owner: {},
    })
  }
  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {},
    })
  }
  assetParams = async ({ denom }: { denom: string }): Promise<NullableAssetParamsBaseForAddr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      asset_params: {
        denom,
      },
    })
  }
  allAssetParams = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<ArrayOfAssetParamsBaseForAddr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_asset_params: {
        limit,
        start_after: startAfter,
      },
    })
  }
  vaultConfig = async ({ address }: { address: string }): Promise<VaultConfigBaseForAddr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      vault_config: {
        address,
      },
    })
  }
  allVaultConfigs = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<ArrayOfVaultConfigBaseForAddr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_vault_configs: {
        limit,
        start_after: startAfter,
      },
    })
  }
  allVaultConfigsV2 = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<PaginationResponseForVaultConfigBaseForAddr> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_vault_configs_v2: {
        limit,
        start_after: startAfter,
      },
    })
  }
  perpParams = async ({ denom }: { denom: string }): Promise<PerpParams> => {
    return this.client.queryContractSmart(this.contractAddress, {
      perp_params: {
        denom,
      },
    })
  }
  allPerpParams = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<ArrayOfPerpParams> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_perp_params: {
        limit,
        start_after: startAfter,
      },
    })
  }
  totalDeposit = async ({ denom }: { denom: string }): Promise<TotalDepositResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_deposit: {
        denom,
      },
    })
  }
  allTotalDepositsV2 = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<PaginationResponseForTotalDepositResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_total_deposits_v2: {
        limit,
        start_after: startAfter,
      },
    })
  }
}
export interface MarsParamsInterface extends MarsParamsReadOnlyInterface {
  contractAddress: string
  sender: string
  updateOwner: (
    ownerUpdate: OwnerUpdate,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  updateConfig: (
    {
      addressProvider,
    }: {
      addressProvider?: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  updateAssetParams: (
    assetParamsUpdate: AssetParamsUpdate,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  updateVaultConfig: (
    vaultConfigUpdate: VaultConfigUpdate,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  updatePerpParams: (
    perpParamsUpdate: PerpParamsUpdate,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  emergencyUpdate: (
    emergencyUpdate: EmergencyUpdate,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
}
export class MarsParamsClient extends MarsParamsQueryClient implements MarsParamsInterface {
  client: SigningCosmWasmClient
  sender: string
  contractAddress: string
  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress)
    this.client = client
    this.sender = sender
    this.contractAddress = contractAddress
    this.updateOwner = this.updateOwner.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
    this.updateAssetParams = this.updateAssetParams.bind(this)
    this.updateVaultConfig = this.updateVaultConfig.bind(this)
    this.updatePerpParams = this.updatePerpParams.bind(this)
    this.emergencyUpdate = this.emergencyUpdate.bind(this)
  }
  updateOwner = async (
    ownerUpdate: OwnerUpdate,
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_owner: ownerUpdate,
      },
      fee,
      memo,
      _funds,
    )
  }
  updateConfig = async (
    {
      addressProvider,
    }: {
      addressProvider?: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_config: {
          address_provider: addressProvider,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  updateAssetParams = async (
    assetParamsUpdate: AssetParamsUpdate,
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_asset_params: assetParamsUpdate,
      },
      fee,
      memo,
      _funds,
    )
  }
  updateVaultConfig = async (
    vaultConfigUpdate: VaultConfigUpdate,
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_vault_config: vaultConfigUpdate,
      },
      fee,
      memo,
      _funds,
    )
  }
  updatePerpParams = async (
    perpParamsUpdate: PerpParamsUpdate,
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_perp_params: perpParamsUpdate,
      },
      fee,
      memo,
      _funds,
    )
  }
  emergencyUpdate = async (
    emergencyUpdate: EmergencyUpdate,
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        emergency_update: emergencyUpdate,
      },
      fee,
      memo,
      _funds,
    )
  }
}
