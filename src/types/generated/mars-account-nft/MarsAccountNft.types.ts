// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.30.1.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

export type Uint128 = string
export interface InstantiateMsg {
  health_contract?: string | null
  max_value_for_burn: Uint128
  minter: string
  name: string
  symbol: string
}
export type ExecuteMsg =
  | {
      update_config: {
        updates: NftConfigUpdates
      }
    }
  | {
      mint: {
        user: string
      }
    }
  | {
      burn: {
        token_id: string
      }
    }
  | {
      transfer_nft: {
        recipient: string
        token_id: string
      }
    }
  | {
      send_nft: {
        contract: string
        msg: Binary
        token_id: string
      }
    }
  | {
      approve: {
        expires?: Expiration | null
        spender: string
        token_id: string
      }
    }
  | {
      revoke: {
        spender: string
        token_id: string
      }
    }
  | {
      approve_all: {
        expires?: Expiration | null
        operator: string
      }
    }
  | {
      revoke_all: {
        operator: string
      }
    }
  | {
      update_ownership: Action
    }
export type Binary = string
export type Expiration =
  | {
      at_height: number
    }
  | {
      at_time: Timestamp
    }
  | {
      never: {}
    }
export type Timestamp = Uint64
export type Uint64 = string
export type Action =
  | {
      transfer_ownership: {
        expiry?: Expiration | null
        new_owner: string
      }
    }
  | 'accept_ownership'
  | 'renounce_ownership'
export interface NftConfigUpdates {
  health_contract_addr?: string | null
  max_value_for_burn?: Uint128 | null
}
export type QueryMsg =
  | {
      config: {}
    }
  | {
      next_id: {}
    }
  | {
      owner_of: {
        include_expired?: boolean | null
        token_id: string
      }
    }
  | {
      approval: {
        include_expired?: boolean | null
        spender: string
        token_id: string
      }
    }
  | {
      approvals: {
        include_expired?: boolean | null
        token_id: string
      }
    }
  | {
      all_operators: {
        include_expired?: boolean | null
        limit?: number | null
        owner: string
        start_after?: string | null
      }
    }
  | {
      num_tokens: {}
    }
  | {
      contract_info: {}
    }
  | {
      nft_info: {
        token_id: string
      }
    }
  | {
      all_nft_info: {
        include_expired?: boolean | null
        token_id: string
      }
    }
  | {
      tokens: {
        limit?: number | null
        owner: string
        start_after?: string | null
      }
    }
  | {
      all_tokens: {
        limit?: number | null
        start_after?: string | null
      }
    }
  | {
      minter: {}
    }
  | {
      ownership: {}
    }
export interface AllNftInfoResponseForEmpty {
  access: OwnerOfResponse
  info: NftInfoResponseForEmpty
}
export interface OwnerOfResponse {
  approvals: Approval[]
  owner: string
}
export interface Approval {
  expires: Expiration
  spender: string
}
export interface NftInfoResponseForEmpty {
  extension: Empty
  token_uri?: string | null
}
export interface Empty {
  [k: string]: unknown
}
export interface OperatorsResponse {
  operators: Approval[]
}
export interface TokensResponse {
  tokens: string[]
}
export interface ApprovalResponse {
  approval: Approval
}
export interface ApprovalsResponse {
  approvals: Approval[]
}
export interface NftConfigBaseForString {
  health_contract_addr?: string | null
  max_value_for_burn: Uint128
}
export interface ContractInfoResponse {
  name: string
  symbol: string
}
export interface MinterResponse {
  minter?: string | null
}
export type String = string
export interface NumTokensResponse {
  count: number
}
export type Addr = string
export interface OwnershipForAddr {
  owner?: Addr | null
  pending_expiry?: Expiration | null
  pending_owner?: Addr | null
}
