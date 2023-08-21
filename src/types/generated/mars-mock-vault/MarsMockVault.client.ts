// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.33.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { CosmWasmClient, ExecuteResult, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Coin, StdFee } from '@cosmjs/amino'

import {
  Duration,
  Empty,
  ExecuteMsg,
  ExtensionExecuteMsg,
  ExtensionQueryMsg,
  ForceUnlockExecuteMsg,
  InstantiateMsg,
  LockupExecuteMsg,
  LockupQueryMsg,
  OracleBaseForString,
  QueryMsg,
  Uint128,
  VaultInfoResponse,
  VaultStandardInfoResponse,
} from './MarsMockVault.types'
export interface MarsMockVaultReadOnlyInterface {
  contractAddress: string
  vaultStandardInfo: () => Promise<VaultStandardInfoResponse>
  info: () => Promise<VaultInfoResponse>
  previewDeposit: ({ amount }: { amount: Uint128 }) => Promise<Uint128>
  previewRedeem: ({ amount }: { amount: Uint128 }) => Promise<Uint128>
  totalAssets: () => Promise<Uint128>
  totalVaultTokenSupply: () => Promise<Uint128>
  convertToShares: ({ amount }: { amount: Uint128 }) => Promise<Uint128>
  convertToAssets: ({ amount }: { amount: Uint128 }) => Promise<Uint128>
  vaultExtension: (extensionQueryMsg: ExtensionQueryMsg) => Promise<Empty>
}
export class MarsMockVaultQueryClient implements MarsMockVaultReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.vaultStandardInfo = this.vaultStandardInfo.bind(this)
    this.info = this.info.bind(this)
    this.previewDeposit = this.previewDeposit.bind(this)
    this.previewRedeem = this.previewRedeem.bind(this)
    this.totalAssets = this.totalAssets.bind(this)
    this.totalVaultTokenSupply = this.totalVaultTokenSupply.bind(this)
    this.convertToShares = this.convertToShares.bind(this)
    this.convertToAssets = this.convertToAssets.bind(this)
    this.vaultExtension = this.vaultExtension.bind(this)
  }

  vaultStandardInfo = async (): Promise<VaultStandardInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      vault_standard_info: {},
    })
  }
  info = async (): Promise<VaultInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      info: {},
    })
  }
  previewDeposit = async ({ amount }: { amount: Uint128 }): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      preview_deposit: {
        amount,
      },
    })
  }
  previewRedeem = async ({ amount }: { amount: Uint128 }): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      preview_redeem: {
        amount,
      },
    })
  }
  totalAssets = async (): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_assets: {},
    })
  }
  totalVaultTokenSupply = async (): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_vault_token_supply: {},
    })
  }
  convertToShares = async ({ amount }: { amount: Uint128 }): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      convert_to_shares: {
        amount,
      },
    })
  }
  convertToAssets = async ({ amount }: { amount: Uint128 }): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      convert_to_assets: {
        amount,
      },
    })
  }
  vaultExtension = async (extensionQueryMsg: ExtensionQueryMsg): Promise<Empty> => {
    return this.client.queryContractSmart(this.contractAddress, {
      vault_extension: extensionQueryMsg,
    })
  }
}
export interface MarsMockVaultInterface extends MarsMockVaultReadOnlyInterface {
  contractAddress: string
  sender: string
  deposit: (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  redeem: (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  vaultExtension: (
    extensionExecuteMsg: ExtensionExecuteMsg,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
}
export class MarsMockVaultClient
  extends MarsMockVaultQueryClient
  implements MarsMockVaultInterface
{
  client: SigningCosmWasmClient
  sender: string
  contractAddress: string

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress)
    this.client = client
    this.sender = sender
    this.contractAddress = contractAddress
    this.deposit = this.deposit.bind(this)
    this.redeem = this.redeem.bind(this)
    this.vaultExtension = this.vaultExtension.bind(this)
  }

  deposit = async (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        deposit: {
          amount,
          recipient,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  redeem = async (
    {
      amount,
      recipient,
    }: {
      amount: Uint128
      recipient?: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        redeem: {
          amount,
          recipient,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  vaultExtension = async (
    extensionExecuteMsg: ExtensionExecuteMsg,
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        vault_extension: extensionExecuteMsg,
      },
      fee,
      memo,
      _funds,
    )
  }
}
