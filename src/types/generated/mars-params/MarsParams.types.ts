// @ts-nocheck
/**
 * This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the @cosmwasm/ts-codegen generate command to regenerate this file.
 */

export type Decimal = string
export interface InstantiateMsg {
  address_provider: string
  owner: string
  target_health_factor: Decimal
}
export type ExecuteMsg =
  | {
      update_owner: OwnerUpdate
    }
  | {
      update_config: {
        address_provider?: string | null
      }
    }
  | {
      update_target_health_factor: Decimal
    }
  | {
      update_asset_params: AssetParamsUpdate
    }
  | {
      update_vault_config: VaultConfigUpdate
    }
  | {
      update_perp_params: PerpParamsUpdate
    }
  | {
      emergency_update: EmergencyUpdate
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
export type AssetParamsUpdate = {
  add_or_update: {
    params: AssetParamsBaseForString
  }
}
export type HlsAssetTypeForString =
  | {
      coin: {
        denom: string
      }
    }
  | {
      vault: {
        addr: string
      }
    }
export type Uint128 = string
export type VaultConfigUpdate = {
  add_or_update: {
    config: VaultConfigBaseForString
  }
}
export type PerpParamsUpdate = {
  add_or_update: {
    params: PerpParams
  }
}
export type EmergencyUpdate =
  | {
      credit_manager: CmEmergencyUpdate
    }
  | {
      red_bank: RedBankEmergencyUpdate
    }
export type CmEmergencyUpdate =
  | {
      set_zero_max_ltv_on_vault: string
    }
  | {
      set_zero_deposit_cap_on_vault: string
    }
  | {
      disallow_coin: string
    }
export type RedBankEmergencyUpdate = {
  disable_borrowing: string
}
export interface AssetParamsBaseForString {
  credit_manager: CmSettingsForString
  denom: string
  deposit_cap: Uint128
  liquidation_bonus: LiquidationBonus
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
  protocol_liquidation_fee: Decimal
  red_bank: RedBankSettings
}
export interface CmSettingsForString {
  hls?: HlsParamsBaseForString | null
  whitelisted: boolean
}
export interface HlsParamsBaseForString {
  correlations: HlsAssetTypeForString[]
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
}
export interface LiquidationBonus {
  max_lb: Decimal
  min_lb: Decimal
  slope: Decimal
  starting_lb: Decimal
}
export interface RedBankSettings {
  borrow_enabled: boolean
  deposit_enabled: boolean
}
export interface VaultConfigBaseForString {
  addr: string
  deposit_cap: Coin
  hls?: HlsParamsBaseForString | null
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
  whitelisted: boolean
}
export interface Coin {
  amount: Uint128
  denom: string
  [k: string]: unknown
}
export interface PerpParams {
  denom: string
  max_long_oi: Uint128
  max_short_oi: Uint128
}
export type QueryMsg =
  | {
      owner: {}
    }
  | {
      config: {}
    }
  | {
      asset_params: {
        denom: string
      }
    }
  | {
      all_asset_params: {
        limit?: number | null
        start_after?: string | null
      }
    }
  | {
      vault_config: {
        address: string
      }
    }
  | {
      all_vault_configs: {
        limit?: number | null
        start_after?: string | null
      }
    }
  | {
      perp_params: {
        denom: string
      }
    }
  | {
      all_perp_params: {
        limit?: number | null
        start_after?: string | null
      }
    }
  | {
      target_health_factor: {}
    }
  | {
      total_deposit: {
        denom: string
      }
    }
export type HlsAssetTypeForAddr =
  | {
      coin: {
        denom: string
      }
    }
  | {
      vault: {
        addr: Addr
      }
    }
export type Addr = string
export type ArrayOfAssetParamsBaseForAddr = AssetParamsBaseForAddr[]
export interface AssetParamsBaseForAddr {
  credit_manager: CmSettingsForAddr
  denom: string
  deposit_cap: Uint128
  liquidation_bonus: LiquidationBonus
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
  protocol_liquidation_fee: Decimal
  red_bank: RedBankSettings
}
export interface CmSettingsForAddr {
  hls?: HlsParamsBaseForAddr | null
  whitelisted: boolean
}
export interface HlsParamsBaseForAddr {
  correlations: HlsAssetTypeForAddr[]
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
}
export type ArrayOfPerpParams = PerpParams[]
export type ArrayOfVaultConfigBaseForAddr = VaultConfigBaseForAddr[]
export interface VaultConfigBaseForAddr {
  addr: Addr
  deposit_cap: Coin
  hls?: HlsParamsBaseForAddr | null
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
  whitelisted: boolean
}
export interface ConfigResponse {
  address_provider: string
}
export interface OwnerResponse {
  abolished: boolean
  emergency_owner?: string | null
  initialized: boolean
  owner?: string | null
  proposed?: string | null
}
export interface TotalDepositResponse {
  amount: Uint128
  cap: Uint128
  denom: string
}
