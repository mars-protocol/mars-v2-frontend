// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { CosmWasmClient, ExecuteResult, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Coin, StdFee } from '@cosmjs/amino'

import {
  AddressResponseItem,
  ArrayOfAddressResponseItem,
  ConfigResponse,
  ExecuteMsg,
  InstantiateMsg,
  MarsAddressType,
  OwnerUpdate,
  QueryMsg,
} from './MarsAddressProvider.types'
export interface MarsAddressProviderReadOnlyInterface {
  contractAddress: string
  config: () => Promise<ConfigResponse>
  address: (marsAddressType: MarsAddressType) => Promise<AddressResponseItem>
  addresses: () => Promise<ArrayOfAddressResponseItem>
  allAddresses: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: MarsAddressType
  }) => Promise<ArrayOfAddressResponseItem>
}
export class MarsAddressProviderQueryClient implements MarsAddressProviderReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.config = this.config.bind(this)
    this.address = this.address.bind(this)
    this.addresses = this.addresses.bind(this)
    this.allAddresses = this.allAddresses.bind(this)
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {},
    })
  }
  address = async (marsAddressType: MarsAddressType): Promise<AddressResponseItem> => {
    return this.client.queryContractSmart(this.contractAddress, {
      address: marsAddressType,
    })
  }
  addresses = async (): Promise<ArrayOfAddressResponseItem> => {
    return this.client.queryContractSmart(this.contractAddress, {
      addresses: {},
    })
  }
  allAddresses = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: MarsAddressType
  }): Promise<ArrayOfAddressResponseItem> => {
    return this.client.queryContractSmart(this.contractAddress, {
      all_addresses: {
        limit,
        start_after: startAfter,
      },
    })
  }
}
export interface MarsAddressProviderInterface extends MarsAddressProviderReadOnlyInterface {
  contractAddress: string
  sender: string
  setAddress: (
    {
      address,
      addressType,
    }: {
      address: string
      addressType: MarsAddressType
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
}
export class MarsAddressProviderClient
  extends MarsAddressProviderQueryClient
  implements MarsAddressProviderInterface
{
  client: SigningCosmWasmClient
  sender: string
  contractAddress: string

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress)
    this.client = client
    this.sender = sender
    this.contractAddress = contractAddress
    this.setAddress = this.setAddress.bind(this)
    this.updateOwner = this.updateOwner.bind(this)
  }

  setAddress = async (
    {
      address,
      addressType,
    }: {
      address: string
      addressType: MarsAddressType
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        set_address: {
          address,
          address_type: addressType,
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
}
