// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.33.0.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { Coin, StdFee } from '@cosmjs/amino'

import {
  Action,
  Addr,
  AllNftInfoResponseForEmpty,
  Approval,
  ApprovalResponse,
  ApprovalsResponse,
  Binary,
  ContractInfoResponse,
  Empty,
  ExecuteMsg,
  Expiration,
  InstantiateMsg,
  MinterResponse,
  NftConfigBaseForString,
  NftConfigUpdates,
  NftInfoResponseForEmpty,
  NumTokensResponse,
  OperatorsResponse,
  OwnerOfResponse,
  OwnershipForAddr,
  QueryMsg,
  String,
  Timestamp,
  TokensResponse,
  Uint128,
  Uint64,
} from './MarsAccountNft.types'
import { MarsAccountNftClient, MarsAccountNftQueryClient } from './MarsAccountNft.client'
export const marsAccountNftQueryKeys = {
  contract: [
    {
      contract: 'marsAccountNft',
    },
  ] as const,
  address: (contractAddress: string | undefined) =>
    [{ ...marsAccountNftQueryKeys.contract[0], address: contractAddress }] as const,
  config: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'config', args }] as const,
  nextId: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'next_id', args }] as const,
  ownerOf: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'owner_of', args }] as const,
  approval: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'approval', args }] as const,
  approvals: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'approvals', args },
    ] as const,
  allOperators: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'all_operators', args },
    ] as const,
  numTokens: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'num_tokens', args },
    ] as const,
  contractInfo: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'contract_info', args },
    ] as const,
  nftInfo: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'nft_info', args }] as const,
  allNftInfo: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'all_nft_info', args },
    ] as const,
  tokens: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'tokens', args }] as const,
  allTokens: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'all_tokens', args },
    ] as const,
  minter: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [{ ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'minter', args }] as const,
  ownership: (contractAddress: string | undefined, args?: Record<string, unknown>) =>
    [
      { ...marsAccountNftQueryKeys.address(contractAddress)[0], method: 'ownership', args },
    ] as const,
}
export interface MarsAccountNftReactQuery<TResponse, TData = TResponse> {
  client: MarsAccountNftQueryClient | undefined
  options?: Omit<
    UseQueryOptions<TResponse, Error, TData>,
    "'queryKey' | 'queryFn' | 'initialData'"
  > & {
    initialData?: undefined
  }
}
export interface MarsAccountNftOwnershipQuery<TData>
  extends MarsAccountNftReactQuery<OwnershipForAddr, TData> {}
export function useMarsAccountNftOwnershipQuery<TData = OwnershipForAddr>({
  client,
  options,
}: MarsAccountNftOwnershipQuery<TData>) {
  return useQuery<OwnershipForAddr, Error, TData>(
    marsAccountNftQueryKeys.ownership(client?.contractAddress),
    () => (client ? client.ownership() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftMinterQuery<TData>
  extends MarsAccountNftReactQuery<MinterResponse, TData> {}
export function useMarsAccountNftMinterQuery<TData = MinterResponse>({
  client,
  options,
}: MarsAccountNftMinterQuery<TData>) {
  return useQuery<MinterResponse, Error, TData>(
    marsAccountNftQueryKeys.minter(client?.contractAddress),
    () => (client ? client.minter() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftAllTokensQuery<TData>
  extends MarsAccountNftReactQuery<TokensResponse, TData> {
  args: {
    limit?: number
    startAfter?: string
  }
}
export function useMarsAccountNftAllTokensQuery<TData = TokensResponse>({
  client,
  args,
  options,
}: MarsAccountNftAllTokensQuery<TData>) {
  return useQuery<TokensResponse, Error, TData>(
    marsAccountNftQueryKeys.allTokens(client?.contractAddress, args),
    () =>
      client
        ? client.allTokens({
            limit: args.limit,
            startAfter: args.startAfter,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftTokensQuery<TData>
  extends MarsAccountNftReactQuery<TokensResponse, TData> {
  args: {
    limit?: number
    owner: string
    startAfter?: string
  }
}
export function useMarsAccountNftTokensQuery<TData = TokensResponse>({
  client,
  args,
  options,
}: MarsAccountNftTokensQuery<TData>) {
  return useQuery<TokensResponse, Error, TData>(
    marsAccountNftQueryKeys.tokens(client?.contractAddress, args),
    () =>
      client
        ? client.tokens({
            limit: args.limit,
            owner: args.owner,
            startAfter: args.startAfter,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftAllNftInfoQuery<TData>
  extends MarsAccountNftReactQuery<AllNftInfoResponseForEmpty, TData> {
  args: {
    includeExpired?: boolean
    tokenId: string
  }
}
export function useMarsAccountNftAllNftInfoQuery<TData = AllNftInfoResponseForEmpty>({
  client,
  args,
  options,
}: MarsAccountNftAllNftInfoQuery<TData>) {
  return useQuery<AllNftInfoResponseForEmpty, Error, TData>(
    marsAccountNftQueryKeys.allNftInfo(client?.contractAddress, args),
    () =>
      client
        ? client.allNftInfo({
            includeExpired: args.includeExpired,
            tokenId: args.tokenId,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftNftInfoQuery<TData>
  extends MarsAccountNftReactQuery<NftInfoResponseForEmpty, TData> {
  args: {
    tokenId: string
  }
}
export function useMarsAccountNftNftInfoQuery<TData = NftInfoResponseForEmpty>({
  client,
  args,
  options,
}: MarsAccountNftNftInfoQuery<TData>) {
  return useQuery<NftInfoResponseForEmpty, Error, TData>(
    marsAccountNftQueryKeys.nftInfo(client?.contractAddress, args),
    () =>
      client
        ? client.nftInfo({
            tokenId: args.tokenId,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftContractInfoQuery<TData>
  extends MarsAccountNftReactQuery<ContractInfoResponse, TData> {}
export function useMarsAccountNftContractInfoQuery<TData = ContractInfoResponse>({
  client,
  options,
}: MarsAccountNftContractInfoQuery<TData>) {
  return useQuery<ContractInfoResponse, Error, TData>(
    marsAccountNftQueryKeys.contractInfo(client?.contractAddress),
    () => (client ? client.contractInfo() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftNumTokensQuery<TData>
  extends MarsAccountNftReactQuery<NumTokensResponse, TData> {}
export function useMarsAccountNftNumTokensQuery<TData = NumTokensResponse>({
  client,
  options,
}: MarsAccountNftNumTokensQuery<TData>) {
  return useQuery<NumTokensResponse, Error, TData>(
    marsAccountNftQueryKeys.numTokens(client?.contractAddress),
    () => (client ? client.numTokens() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftAllOperatorsQuery<TData>
  extends MarsAccountNftReactQuery<OperatorsResponse, TData> {
  args: {
    includeExpired?: boolean
    limit?: number
    owner: string
    startAfter?: string
  }
}
export function useMarsAccountNftAllOperatorsQuery<TData = OperatorsResponse>({
  client,
  args,
  options,
}: MarsAccountNftAllOperatorsQuery<TData>) {
  return useQuery<OperatorsResponse, Error, TData>(
    marsAccountNftQueryKeys.allOperators(client?.contractAddress, args),
    () =>
      client
        ? client.allOperators({
            includeExpired: args.includeExpired,
            limit: args.limit,
            owner: args.owner,
            startAfter: args.startAfter,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftApprovalsQuery<TData>
  extends MarsAccountNftReactQuery<ApprovalsResponse, TData> {
  args: {
    includeExpired?: boolean
    tokenId: string
  }
}
export function useMarsAccountNftApprovalsQuery<TData = ApprovalsResponse>({
  client,
  args,
  options,
}: MarsAccountNftApprovalsQuery<TData>) {
  return useQuery<ApprovalsResponse, Error, TData>(
    marsAccountNftQueryKeys.approvals(client?.contractAddress, args),
    () =>
      client
        ? client.approvals({
            includeExpired: args.includeExpired,
            tokenId: args.tokenId,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftApprovalQuery<TData>
  extends MarsAccountNftReactQuery<ApprovalResponse, TData> {
  args: {
    includeExpired?: boolean
    spender: string
    tokenId: string
  }
}
export function useMarsAccountNftApprovalQuery<TData = ApprovalResponse>({
  client,
  args,
  options,
}: MarsAccountNftApprovalQuery<TData>) {
  return useQuery<ApprovalResponse, Error, TData>(
    marsAccountNftQueryKeys.approval(client?.contractAddress, args),
    () =>
      client
        ? client.approval({
            includeExpired: args.includeExpired,
            spender: args.spender,
            tokenId: args.tokenId,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftOwnerOfQuery<TData>
  extends MarsAccountNftReactQuery<OwnerOfResponse, TData> {
  args: {
    includeExpired?: boolean
    tokenId: string
  }
}
export function useMarsAccountNftOwnerOfQuery<TData = OwnerOfResponse>({
  client,
  args,
  options,
}: MarsAccountNftOwnerOfQuery<TData>) {
  return useQuery<OwnerOfResponse, Error, TData>(
    marsAccountNftQueryKeys.ownerOf(client?.contractAddress, args),
    () =>
      client
        ? client.ownerOf({
            includeExpired: args.includeExpired,
            tokenId: args.tokenId,
          })
        : Promise.reject(new Error('Invalid client')),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftNextIdQuery<TData> extends MarsAccountNftReactQuery<String, TData> {}
export function useMarsAccountNftNextIdQuery<TData = String>({
  client,
  options,
}: MarsAccountNftNextIdQuery<TData>) {
  return useQuery<String, Error, TData>(
    marsAccountNftQueryKeys.nextId(client?.contractAddress),
    () => (client ? client.nextId() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftConfigQuery<TData>
  extends MarsAccountNftReactQuery<NftConfigBaseForString, TData> {}
export function useMarsAccountNftConfigQuery<TData = NftConfigBaseForString>({
  client,
  options,
}: MarsAccountNftConfigQuery<TData>) {
  return useQuery<NftConfigBaseForString, Error, TData>(
    marsAccountNftQueryKeys.config(client?.contractAddress),
    () => (client ? client.config() : Promise.reject(new Error('Invalid client'))),
    { ...options, enabled: !!client && (options?.enabled != undefined ? options.enabled : true) },
  )
}
export interface MarsAccountNftUpdateOwnershipMutation {
  client: MarsAccountNftClient
  msg: Action
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftUpdateOwnershipMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftUpdateOwnershipMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftUpdateOwnershipMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.updateOwnership(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftRevokeAllMutation {
  client: MarsAccountNftClient
  msg: {
    operator: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftRevokeAllMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftRevokeAllMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftRevokeAllMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.revokeAll(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftApproveAllMutation {
  client: MarsAccountNftClient
  msg: {
    expires?: Expiration
    operator: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftApproveAllMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftApproveAllMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftApproveAllMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.approveAll(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftRevokeMutation {
  client: MarsAccountNftClient
  msg: {
    spender: string
    tokenId: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftRevokeMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftRevokeMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftRevokeMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.revoke(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftApproveMutation {
  client: MarsAccountNftClient
  msg: {
    expires?: Expiration
    spender: string
    tokenId: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftApproveMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftApproveMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftApproveMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.approve(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftSendNftMutation {
  client: MarsAccountNftClient
  msg: {
    contract: string
    msg: Binary
    tokenId: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftSendNftMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftSendNftMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftSendNftMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.sendNft(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftTransferNftMutation {
  client: MarsAccountNftClient
  msg: {
    recipient: string
    tokenId: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftTransferNftMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftTransferNftMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftTransferNftMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.transferNft(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftBurnMutation {
  client: MarsAccountNftClient
  msg: {
    tokenId: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftBurnMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftBurnMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftBurnMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.burn(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftMintMutation {
  client: MarsAccountNftClient
  msg: {
    user: string
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftMintMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftMintMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftMintMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) => client.mint(msg, fee, memo, funds),
    options,
  )
}
export interface MarsAccountNftUpdateConfigMutation {
  client: MarsAccountNftClient
  msg: {
    updates: NftConfigUpdates
  }
  args?: {
    fee?: number | StdFee | 'auto'
    memo?: string
    funds?: Coin[]
  }
}
export function useMarsAccountNftUpdateConfigMutation(
  options?: Omit<
    UseMutationOptions<ExecuteResult, Error, MarsAccountNftUpdateConfigMutation>,
    'mutationFn'
  >,
) {
  return useMutation<ExecuteResult, Error, MarsAccountNftUpdateConfigMutation>(
    ({ client, msg, args: { fee, memo, funds } = {} }) =>
      client.updateConfig(msg, fee, memo, funds),
    options,
  )
}
