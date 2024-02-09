// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

export type Decimal = string
export type Uint128 = string
export type OracleBaseForString = string
export type ParamsBaseForString = string
export interface InstantiateMsg {
  base_denom: string
  closing_fee_rate: Decimal
  cooldown_period: number
  credit_manager: string
  max_position_in_base_denom?: Uint128 | null
  min_position_in_base_denom: Uint128
  opening_fee_rate: Decimal
  oracle: OracleBaseForString
  params: ParamsBaseForString
}
export type ExecuteMsg =
  | {
  update_owner: OwnerUpdate
}
  | {
  init_denom: {
    denom: string
    max_funding_velocity: Decimal
    skew_scale: Decimal
  }
}
  | {
  enable_denom: {
    denom: string
  }
}
  | {
  disable_denom: {
    denom: string
  }
}
  | {
  deposit: {}
}
  | {
  unlock: {
    shares: Uint128
  }
}
  | {
  withdraw: {}
}
  | {
  open_position: {
    account_id: string
    denom: string
    size: SignedDecimal
  }
}
  | {
  close_position: {
    account_id: string
    denom: string
  }
}
  | {
  modify_position: {
    account_id: string
    denom: string
    new_size: SignedDecimal
  }
}
export type OwnerUpdate =
  | {
  propose_new_owner: {
    proposed: string
  }
}
  | 'clear_proposed'
  | 'accept_proposed'
  | 'abolish_owner_role'
  | {
  set_emergency_owner: {
    emergency_owner: string
  }
}
  | 'clear_emergency_owner'
export interface SignedDecimal {
  abs: Decimal
  negative: boolean
  [k: string]: unknown
}
export type QueryMsg =
  | {
  owner: {}
}
  | {
  config: {}
}
  | {
  vault_state: {}
}
  | {
  denom_state: {
    denom: string
  }
}
  | {
  perp_denom_state: {
    denom: string
  }
}
  | {
  denom_states: {
    limit?: number | null
    start_after?: string | null
  }
}
  | {
  deposit: {
    depositor: string
  }
}
  | {
  deposits: {
    limit?: number | null
    start_after?: string | null
  }
}
  | {
  unlocks: {
    depositor: string
  }
}
  | {
  position: {
    account_id: string
    denom: string
  }
}
  | {
  positions: {
    limit?: number | null
    start_after?: [string, string] | null
  }
}
  | {
  positions_by_account: {
    account_id: string
  }
}
  | {
  total_pnl: {}
}
  | {
  opening_fee: {
    denom: string
    size: SignedDecimal
  }
}
  | {
  denom_accounting: {
    denom: string
  }
}
  | {
  total_accounting: {}
}
  | {
  denom_realized_pnl_for_account: {
    account_id: string
    denom: string
  }
}
export interface ConfigForString {
  base_denom: string
  closing_fee_rate: Decimal
  cooldown_period: number
  credit_manager: string
  max_position_in_base_denom?: Uint128 | null
  min_position_in_base_denom: Uint128
  opening_fee_rate: Decimal
  oracle: OracleBaseForString
  params: ParamsBaseForString
}
export interface Accounting {
  balance: Balance
  cash_flow: CashFlow
  withdrawal_balance: Balance
}
export interface Balance {
  accrued_funding: SignedDecimal
  closing_fee: SignedDecimal
  opening_fee: SignedDecimal
  price_pnl: SignedDecimal
  total: SignedDecimal
}
export interface CashFlow {
  accrued_funding: SignedDecimal
  closing_fee: SignedDecimal
  opening_fee: SignedDecimal
  price_pnl: SignedDecimal
}
export interface RealizedPnlAmounts {
  accrued_funding: SignedDecimal
  closing_fee: SignedDecimal
  opening_fee: SignedDecimal
  pnl: SignedDecimal
  price_pnl: SignedDecimal
}
export interface DenomStateResponse {
  denom: string
  enabled: boolean
  funding: Funding
  last_updated: number
  total_cost_base: SignedDecimal
}
export interface Funding {
  last_funding_accrued_per_unit_in_base_denom: SignedDecimal
  last_funding_rate: SignedDecimal
  max_funding_velocity: Decimal
  skew_scale: Decimal
}
export type ArrayOfDenomStateResponse = DenomStateResponse[]
export interface DepositResponse {
  amount: Uint128
  depositor: string
  shares: Uint128
}
export type ArrayOfDepositResponse = DepositResponse[]
export interface TradingFee {
  fee: Coin
  rate: Decimal
}
export interface Coin {
  amount: Uint128
  denom: string
  [k: string]: unknown
}
export interface OwnerResponse {
  abolished: boolean
  emergency_owner?: string | null
  initialized: boolean
  owner?: string | null
  proposed?: string | null
}
export interface PerpDenomState {
  denom: string
  enabled: boolean
  long_oi: Decimal
  pnl_values: DenomPnlValues
  rate: SignedDecimal
  short_oi: Decimal
  total_entry_cost: SignedDecimal
  total_entry_funding: SignedDecimal
}
export interface DenomPnlValues {
  accrued_funding: SignedDecimal
  closing_fees: SignedDecimal
  pnl: SignedDecimal
  price_pnl: SignedDecimal
}
export type PnL =
  | 'break_even'
  | {
  profit: Coin
}
  | {
  loss: Coin
}
export interface PositionResponse {
  account_id: string
  position: PerpPosition
}
export interface PerpPosition {
  base_denom: string
  closing_fee_rate: Decimal
  current_exec_price: Decimal
  current_price: Decimal
  denom: string
  entry_exec_price: Decimal
  entry_price: Decimal
  realised_pnl: RealizedPnlAmounts
  size: SignedDecimal
  unrealised_pnl: PositionPnl
}
export interface PositionPnl {
  coins: PnlCoins
  values: PnlValues
}
export interface PnlCoins {
  closing_fee: Coin
  pnl: PnL
}
export interface PnlValues {
  accrued_funding: SignedDecimal
  closing_fee: SignedDecimal
  pnl: SignedDecimal
  price_pnl: SignedDecimal
}
export type ArrayOfPositionResponse = PositionResponse[]
export interface PositionsByAccountResponse {
  account_id: string
  positions: PerpPosition[]
}
export type ArrayOfUnlockState = UnlockState[]
export interface UnlockState {
  amount: Uint128
  cooldown_end: number
  created_at: number
}
export interface VaultState {
  total_liquidity: Uint128
  total_shares: Uint128
}
