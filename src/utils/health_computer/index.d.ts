/* tslint:disable */
/* eslint-disable */
/**
 * @param {any} health_computer
 * @returns {any}
 */
export function compute_health_js(health_computer: any): any
/**
 * @param {any} health_computer
 * @param {any} withdraw_denom
 * @returns {any}
 */
export function max_withdraw_estimate_js(health_computer: any, withdraw_denom: any): any
/**
 * @param {any} health_computer
 * @param {any} borrow_denom
 * @param {any} target
 * @returns {any}
 */
export function max_borrow_estimate_js(health_computer: any, borrow_denom: any, target: any): any

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module

export interface InitOutput {
  readonly memory: WebAssembly.Memory
  readonly compute_health_js: (a: number) => number
  readonly max_withdraw_estimate_js: (a: number, b: number) => number
  readonly max_borrow_estimate_js: (a: number, b: number, c: number) => number
  readonly allocate: (a: number) => number
  readonly deallocate: (a: number) => void
  readonly requires_stargate: () => void
  readonly requires_iterator: () => void
  readonly interface_version_8: () => void
  readonly __wbindgen_malloc: (a: number, b: number) => number
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number
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
