// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { Coin } from '@cosmjs/amino'
import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { toUtf8 } from '@cosmjs/encoding'
import {
  Decimal,
  InstantiateMsg,
  CoinPrice,
  ExecuteMsg,
  QueryMsg,
  PriceResponse,
} from './MarsMockOracle.types'
export interface MarsMockOracleMessage {
  contractAddress: string
  sender: string
  changePrice: (
    {
      denom,
      price,
    }: {
      denom: string
      price: Decimal
    },
    _funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
}
export class MarsMockOracleMessageComposer implements MarsMockOracleMessage {
  sender: string
  contractAddress: string

  constructor(sender: string, contractAddress: string) {
    this.sender = sender
    this.contractAddress = contractAddress
    this.changePrice = this.changePrice.bind(this)
  }

  changePrice = (
    {
      denom,
      price,
    }: {
      denom: string
      price: Decimal
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
            change_price: {
              denom,
              price,
            },
          }),
        ),
        funds: _funds,
      }),
    }
  }
}
