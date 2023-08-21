// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.33.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { Coin } from '@cosmjs/amino'
import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { toUtf8 } from '@cosmjs/encoding'

import {
  AccountKind,
  ActionKind,
  ConfigResponse,
  Decimal,
  ExecuteMsg,
  HealthState,
  HealthValuesResponse,
  InstantiateMsg,
  OwnerResponse,
  OwnerUpdate,
  QueryMsg,
  Uint128,
} from './MarsRoverHealthTypes.types'
export interface MarsRoverHealthTypesMessage {
  contractAddress: string
  sender: string
  updateOwner: (ownerUpdate: OwnerUpdate, _funds?: Coin[]) => MsgExecuteContractEncodeObject
  updateConfig: (
    {
      creditManager,
    }: {
      creditManager: string
    },
    _funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
}
export class MarsRoverHealthTypesMessageComposer implements MarsRoverHealthTypesMessage {
  sender: string
  contractAddress: string

  constructor(sender: string, contractAddress: string) {
    this.sender = sender
    this.contractAddress = contractAddress
    this.updateOwner = this.updateOwner.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
  }

  updateOwner = (ownerUpdate: OwnerUpdate, _funds?: Coin[]): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            update_owner: ownerUpdate,
          }),
        ),
        funds: _funds,
      }),
    }
  }
  updateConfig = (
    {
      creditManager,
    }: {
      creditManager: string
    },
    _funds?: Coin[],
  ): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            update_config: {
              credit_manager: creditManager,
            },
          }),
        ),
        funds: _funds,
      }),
    }
  }
}
