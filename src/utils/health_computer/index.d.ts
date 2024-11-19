/* tslint:disable */
/* eslint-disable */
/**
 * @param {HealthComputer} c
 * @returns {HealthValuesResponse}
 */
export function compute_health_js(c: HealthComputer): HealthValuesResponse
/**
 * @param {HealthComputer} c
 * @param {string} withdraw_denom
 * @returns {string}
 */
export function max_withdraw_estimate_js(c: HealthComputer, withdraw_denom: string): string
/**
 * @param {HealthComputer} c
 * @param {string} borrow_denom
 * @param {BorrowTarget} target
 * @returns {string}
 */
export function max_borrow_estimate_js(
  c: HealthComputer,
  borrow_denom: string,
  target: BorrowTarget,
): string
/**
 * @param {HealthComputer} c
 * @param {string} from_denom
 * @param {string} to_denom
 * @param {SwapKind} kind
 * @param {Number} slippage
 * @param {boolean} is_repaying_debt
 * @returns {string}
 */
export function max_swap_estimate_js(
  c: HealthComputer,
  from_denom: string,
  to_denom: string,
  kind: SwapKind,
  slippage: Number,
  is_repaying_debt: boolean,
): string
/**
 * @param {HealthComputer} c
 * @param {string} denom
 * @param {LiquidationPriceKind} kind
 * @returns {string}
 */
export function liquidation_price_js(
  c: HealthComputer,
  denom: string,
  kind: LiquidationPriceKind,
): string
/**
 * @param {HealthComputer} c
 * @param {string} denom
 * @param {string} base_denom
 * @param {Uint} long_oi_amount
 * @param {Uint} short_oi_amount
 * @param {Direction} direction
 * @returns {string}
 */
export function max_perp_size_estimate_js(
  c: HealthComputer,
  denom: string,
  base_denom: string,
  long_oi_amount: Uint,
  short_oi_amount: Uint,
  direction: Direction,
): string
export type Direction = 'long' | 'short'

export interface HealthComputer {
  kind: AccountKind
  positions: Positions
  asset_params: Record<string, AssetParams>
  vaults_data: VaultsData
  perps_data: PerpsData
  oracle_prices: Record<string, Decimal>
}

export interface HealthValuesResponse {
  total_debt_value: Uint128
  total_collateral_value: Uint128
  max_ltv_adjusted_collateral: Uint128
  liquidation_threshold_adjusted_collateral: Uint128
  max_ltv_health_factor: Decimal | null
  liquidation_health_factor: Decimal | null
  perps_pnl_profit: Uint128
  perps_pnl_loss: Uint128
  liquidatable: boolean
  above_max_ltv: boolean
  has_perps: boolean
}

export type LiquidationPriceKind = 'asset' | 'debt' | 'perp'

export type Uint = Uint128

export type Number = Decimal

export type SwapKind = 'default' | 'margin'

export type BorrowTarget =
  | 'deposit'
  | 'wallet'
  | { vault: { address: Addr } }
  | { swap: { denom_out: string; slippage: Decimal } }

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module

export interface InitOutput {
  readonly memory: WebAssembly.Memory
  readonly compute_health_js: (a: number) => number
  readonly max_withdraw_estimate_js: (a: number, b: number, c: number, d: number) => void
  readonly max_borrow_estimate_js: (a: number, b: number, c: number, d: number, e: number) => void
  readonly max_swap_estimate_js: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
  ) => void
  readonly liquidation_price_js: (a: number, b: number, c: number, d: number, e: number) => void
  readonly max_perp_size_estimate_js: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
  ) => void
  readonly interface_version_8: () => void
  readonly allocate: (a: number) => number
  readonly deallocate: (a: number) => void
  readonly requires_iterator: () => void
  readonly __wbindgen_malloc: (a: number, b: number) => number
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number
  readonly __wbindgen_free: (a: number, b: number, c: number) => void
  readonly __wbindgen_exn_store: (a: number) => void
}

export type SyncInitInput = BufferSource | WebAssembly.Module
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {SyncInitInput} module
 *
 * @returns {InitOutput}
 */
export function initSync(module: SyncInitInput): InitOutput

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?: InitInput | Promise<InitInput>,
): Promise<InitOutput>
