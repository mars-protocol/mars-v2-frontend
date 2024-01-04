// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { StdFee } from '@cosmjs/amino'
import {
  Uint128,
  OracleBaseForString,
  InstantiateMsg,
  ExecuteMsg,
  OwnerUpdate,
  Decimal,
  SignedDecimal,
  QueryMsg,
  ConfigForString,
  DenomStateResponse,
  Funding,
  ArrayOfDenomStateResponse,
  DepositResponse,
  ArrayOfDepositResponse,
  OwnerResponse,
  PerpDenomState,
  PnlValues,
  PnL,
  PositionResponse,
  PerpPosition,
  Coin,
  ArrayOfPositionResponse,
  PositionsByAccountResponse,
  ArrayOfUnlockState,
  UnlockState,
  VaultState,
} from './MarsPerps.types'
export interface MarsPerpsReadOnlyInterface {
  contractAddress: string
  owner: () => Promise<OwnerResponse>
  config: () => Promise<ConfigForString>
  vaultState: () => Promise<VaultState>
  denomState: ({ denom }: { denom: string }) => Promise<DenomStateResponse>
  perpDenomState: ({ denom }: { denom: string }) => Promise<PerpDenomState>
  denomStates: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<ArrayOfDenomStateResponse>
  deposit: ({ depositor }: { depositor: string }) => Promise<DepositResponse>
  deposits: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }) => Promise<ArrayOfDepositResponse>
  unlocks: ({ depositor }: { depositor: string }) => Promise<ArrayOfUnlockState>
  position: ({
    accountId,
    denom,
  }: {
    accountId: string
    denom: string
  }) => Promise<PositionResponse>
  positions: ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string[][]
  }) => Promise<ArrayOfPositionResponse>
  positionsByAccount: ({ accountId }: { accountId: string }) => Promise<PositionsByAccountResponse>
  totalPnl: () => Promise<SignedDecimal>
}
export class MarsPerpsQueryClient implements MarsPerpsReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.owner = this.owner.bind(this)
    this.config = this.config.bind(this)
    this.vaultState = this.vaultState.bind(this)
    this.denomState = this.denomState.bind(this)
    this.perpDenomState = this.perpDenomState.bind(this)
    this.denomStates = this.denomStates.bind(this)
    this.deposit = this.deposit.bind(this)
    this.deposits = this.deposits.bind(this)
    this.unlocks = this.unlocks.bind(this)
    this.position = this.position.bind(this)
    this.positions = this.positions.bind(this)
    this.positionsByAccount = this.positionsByAccount.bind(this)
    this.totalPnl = this.totalPnl.bind(this)
  }

  owner = async (): Promise<OwnerResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      owner: {},
    })
  }
  config = async (): Promise<ConfigForString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {},
    })
  }
  vaultState = async (): Promise<VaultState> => {
    return this.client.queryContractSmart(this.contractAddress, {
      vault_state: {},
    })
  }
  denomState = async ({ denom }: { denom: string }): Promise<DenomStateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      denom_state: {
        denom,
      },
    })
  }
  perpDenomState = async ({ denom }: { denom: string }): Promise<PerpDenomState> => {
    return this.client.queryContractSmart(this.contractAddress, {
      perp_denom_state: {
        denom,
      },
    })
  }
  denomStates = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<ArrayOfDenomStateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      denom_states: {
        limit,
        start_after: startAfter,
      },
    })
  }
  deposit = async ({ depositor }: { depositor: string }): Promise<DepositResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      deposit: {
        depositor,
      },
    })
  }
  deposits = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string
  }): Promise<ArrayOfDepositResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      deposits: {
        limit,
        start_after: startAfter,
      },
    })
  }
  unlocks = async ({ depositor }: { depositor: string }): Promise<ArrayOfUnlockState> => {
    return this.client.queryContractSmart(this.contractAddress, {
      unlocks: {
        depositor,
      },
    })
  }
  position = async ({
    accountId,
    denom,
  }: {
    accountId: string
    denom: string
  }): Promise<PositionResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      position: {
        account_id: accountId,
        denom,
      },
    })
  }
  positions = async ({
    limit,
    startAfter,
  }: {
    limit?: number
    startAfter?: string[][]
  }): Promise<ArrayOfPositionResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      positions: {
        limit,
        start_after: startAfter,
      },
    })
  }
  positionsByAccount = async ({
    accountId,
  }: {
    accountId: string
  }): Promise<PositionsByAccountResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      positions_by_account: {
        account_id: accountId,
      },
    })
  }
  totalPnl = async (): Promise<SignedDecimal> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_pnl: {},
    })
  }
}
export interface MarsPerpsInterface extends MarsPerpsReadOnlyInterface {
  contractAddress: string
  sender: string
  updateOwner: (
    ownerUpdate: OwnerUpdate,
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  initDenom: (
    {
      denom,
      maxFundingVelocity,
      skewScale,
    }: {
      denom: string
      maxFundingVelocity: Decimal
      skewScale: Decimal
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  enableDenom: (
    {
      denom,
    }: {
      denom: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  disableDenom: (
    {
      denom,
    }: {
      denom: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  deposit: (
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  unlock: (
    {
      shares,
    }: {
      shares: Uint128
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  withdraw: (
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  openPosition: (
    {
      accountId,
      denom,
      size,
    }: {
      accountId: string
      denom: string
      size: SignedDecimal
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
  closePosition: (
    {
      accountId,
      denom,
    }: {
      accountId: string
      denom: string
    },
    fee?: number | StdFee | 'auto',
    memo?: string,
    _funds?: Coin[],
  ) => Promise<ExecuteResult>
}
export class MarsPerpsClient extends MarsPerpsQueryClient implements MarsPerpsInterface {
  client: SigningCosmWasmClient
  sender: string
  contractAddress: string

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress)
    this.client = client
    this.sender = sender
    this.contractAddress = contractAddress
    this.updateOwner = this.updateOwner.bind(this)
    this.initDenom = this.initDenom.bind(this)
    this.enableDenom = this.enableDenom.bind(this)
    this.disableDenom = this.disableDenom.bind(this)
    this.deposit = this.deposit.bind(this)
    this.unlock = this.unlock.bind(this)
    this.withdraw = this.withdraw.bind(this)
    this.openPosition = this.openPosition.bind(this)
    this.closePosition = this.closePosition.bind(this)
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
  initDenom = async (
    {
      denom,
      maxFundingVelocity,
      skewScale,
    }: {
      denom: string
      maxFundingVelocity: Decimal
      skewScale: Decimal
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        init_denom: {
          denom,
          max_funding_velocity: maxFundingVelocity,
          skew_scale: skewScale,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  enableDenom = async (
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
        enable_denom: {
          denom,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  disableDenom = async (
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
        disable_denom: {
          denom,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  deposit = async (
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        deposit: {},
      },
      fee,
      memo,
      _funds,
    )
  }
  unlock = async (
    {
      shares,
    }: {
      shares: Uint128
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        unlock: {
          shares,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  withdraw = async (
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        withdraw: {},
      },
      fee,
      memo,
      _funds,
    )
  }
  openPosition = async (
    {
      accountId,
      denom,
      size,
    }: {
      accountId: string
      denom: string
      size: SignedDecimal
    },
    fee: number | StdFee | 'auto' = 'auto',
    memo?: string,
    _funds?: Coin[],
  ): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        open_position: {
          account_id: accountId,
          denom,
          size,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
  closePosition = async (
    {
      accountId,
      denom,
    }: {
      accountId: string
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
        close_position: {
          account_id: accountId,
          denom,
        },
      },
      fee,
      memo,
      _funds,
    )
  }
}
