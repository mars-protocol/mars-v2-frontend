// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { StdFee } from '@cosmjs/amino'

import {
  Addr,
  CallbackMsg,
  Coin,
  ExecuteMsg,
  InstantiateMsg,
  NewPositionRequest,
  OwnerResponse,
  OwnerUpdate,
  QueryMsg,
  Uint128,
} from './MarsV3ZapperBase.types'
import { MarsV3ZapperBaseClient, MarsV3ZapperBaseQueryClient } from './MarsV3ZapperBase.client'
export const marsV3ZapperBaseQueryKeys = {
  contract: [
    {
      contract: 'marsV3ZapperBase',
    },
  ] as const,
  address: (contractAddress: string | undefined) =>
    [{ ...marsV3ZapperBaseQueryKeys.contract[0], address: contractAddress }] as const,
  owner: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsV3ZapperBaseQueryKeys.address(contractAddress)[0], method: 'owner', args }] as const,
}
export interface MarsV3ZapperBaseReactQuery<TResponse, TData = TResponse> {
  client: MarsV3ZapperBaseQueryClient | undefined
  options?: Omit<
    UseQueryOptions<TResponse, Error, TData>,
    "'queryKey' | 'queryFn' | 'initialData'"
  > & {
    initialData?: undefined
  }
}
export interface MarsV3ZapperBaseOwnerQuery<TData>
  extends MarsV3ZapperBaseReactQuery<OwnerResponse, TData> {}
export function useMarsV3ZapperBaseOwnerQuery<TData = OwnerResponse>({
  client,
  options,
}: MarsV3ZapperBaseOwnerQuery<TData>) {
  return useQuery<OwnerResponse, Error, TData>(
    marsV3ZapperBaseQueryKeys.owner(client?.contractAddress),
    () => (client ? client.owner() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsV3ZapperBaseCallbackMutation {
  client: MarsV3ZapperBaseClient
  msg: CallbackMsg
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsV3ZapperBaseCallbackMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsV3ZapperBaseCallbackMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsV3ZapperBaseCallbackMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.callback(msg, fee, memo, funds),
    options,
  )
}
export interface MarsV3ZapperBaseUpdateOwnerMutation {
  client: MarsV3ZapperBaseClient
  msg: OwnerUpdate
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsV3ZapperBaseUpdateOwnerMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsV3ZapperBaseUpdateOwnerMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsV3ZapperBaseUpdateOwnerMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.updateOwner(msg, fee, memo, funds),
    options,
  )
}
export interface MarsV3ZapperBaseCreatePositionMutation {
  client: MarsV3ZapperBaseClient
  msg: {
    lowerTick: number
    poolId: number
    tokenMinAmount0: string
    tokenMinAmount1: string
    tokensProvided: Coin[]
    upperTick: number
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsV3ZapperBaseCreatePositionMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsV3ZapperBaseCreatePositionMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsV3ZapperBaseCreatePositionMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.createPosition(msg, fee, memo, funds),
    options,
  )
}
