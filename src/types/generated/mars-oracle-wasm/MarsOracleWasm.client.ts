// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@1.10.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { Coin, StdFee } from '@cosmjs/amino'
import { CosmWasmClient, ExecuteResult, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  ActionKind,
  ArrayOfPriceResponse,
  ArrayOfPriceSourceResponseForString,
  ConfigResponse,
  OwnerUpdate,
  PriceResponse,
  PriceSourceResponseForString,
  WasmOracleCustomExecuteMsg,
  WasmPriceSourceForString
} from './MarsOracleWasm.types'
export interface MarsOracleWasmReadOnlyInterface {
  contractAddress: string
  config: () => Promise<ConfigResponse>
  priceSource: ({ denom }: { denom: string }) => Promise<PriceSourceResponseForString>
  priceSources: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<ArrayOfPriceSourceResponseForString>
  price: ({ denom, kind }: { denom: string; kind?: ActionKind }) => Promise<PriceResponse>
  prices: ({
    kind,
    limit,
    startAfter,
  }: {
    kind?: ActionKind
    limit?: number
    startAfter?: string
  }) => Promise<ArrayOfPriceResponse>
}
export class MarsOracleWasmQueryClient implements MarsOracleWasmReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string
  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.config = this.config.bind(this)
    this.priceSource = this.priceSource.bind(this)
    this.priceSources = this.priceSources.bind(this)
    this.price = this.price.bind(this)
    this.prices = this.prices.bind(this)
  }
  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {},
    })
  }
  priceSource = async ({ denom }: { denom: string }): Promise<PriceSourceResponseForString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      price_source: {
        denom,
      },
    })
  }
  priceSources = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<ArrayOfPriceSourceResponseForString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      price_sources: {
        limit,
        start_after: startAfter,
      },
    })
  }
  price = async ({ denom, kind }: { denom: string; kind?: ActionKind }): Promise<PriceResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      price: {
        denom,
        kind,
      },
    })
  }
  prices = async ({
    kind,
    limit,
    startAfter, 
  }: {
    kind?: ActionKind
    limit?: number
    startAfter?: string
  }): Promise<ArrayOfPriceResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      prices: {
        kind,
        limit,
        start_after: startAfter,
      },
    })
  }
}
export interface MarsOracleWasmInterface extends MarsOracleWasmReadOnlyInterface {
  contractAddress: string
  sender: string
  setPriceSource: (
    {
      denom,
      priceSource,
    }: {
      denom: string
      priceSource: WasmPriceSourceForString
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  removePriceSource: (
    {
      denom,
    }: {
      denom: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  updateOwner: (
    ownerUpdate: OwnerUpdate,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  updateConfig: (
    {
      baseDenom,
    }: {
      baseDenom?: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  custom: (
    wasmOracleCustomExecuteMsg: WasmOracleCustomExecuteMsg,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
}
export class MarsOracleWasmClient
  extends MarsOracleWasmQueryClient
  implements MarsOracleWasmInterface
{
  client: SigningCosmWasmClient
  sender: string
  contractAddress: string
  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress)
    this.client = client
    this.sender = sender
    this.contractAddress = contractAddress
    this.setPriceSource = this.setPriceSource.bind(this)
    this.removePriceSource = this.removePriceSource.bind(this)
    this.updateOwner = this.updateOwner.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
    this.custom = this.custom.bind(this)
  }
  setPriceSource = async (
    {
      denom,
      priceSource,
    }: {
      denom: string
      priceSource: WasmPriceSourceForString
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        set_price_source: {
          denom,
          price_source: priceSource,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  removePriceSource = async (
    {
      denom,
    }: {
      denom: string
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        remove_price_source: {
          denom,
        },
      },
      fee,
      memo,
      _funds,
    )
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
      baseDenom,
    }: {
      baseDenom?: string
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
          base_denom: baseDenom,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  custom = async (
    wasmOracleCustomExecuteMsg: WasmOracleCustomExecuteMsg,
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        custom: wasmOracleCustomExecuteMsg,
      },
      fee,
      memo,
      _funds,
    )
  }
}
