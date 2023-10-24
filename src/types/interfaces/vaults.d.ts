type BigNumber = import('bignumber.js').BigNumber

interface VaultMetaData {
  address: string
  name: string
  lockup: {
    duration: number
    timeframe: string
  }
  provider: string
  denoms: {
    primary: string
    secondary: string
    lp: string
    vault: string
  }
  symbols: {
    primary: string
    secondary: string
  }
  isFeatured?: boolean
}

interface VaultInfo {
  address: string
  ltv: {
    max: number
    liq: number
  }
  cap: DepositCap
}

interface VaultConfig extends VaultMetaData, VaultInfo {}

interface Vault extends VaultConfig {
  hls?: {
    maxLTV: number
    maxLeverage: number
    borrowDenom: string
  }
  apy: number | null
  apr: number | null
}

interface VaultValuesAndAmounts {
  amounts: {
    primary: BigNumber
    secondary: BigNumber
    locked: BigNumber
    unlocked: BigNumber
    unlocking: BigNumber
  }
  values: {
    primary: BigNumber
    secondary: BigNumber
    unlocked: BigNumber
    unlocking: BigNumber
  }
}

type VaultStatus = 'active' | 'unlocking' | 'unlocked'

interface DepositedVault extends Vault, VaultValuesAndAmounts {
  status: VaultStatus
  unlockId?: number
  unlocksAt?: number
}

interface VaultExtensionResponse {
  base_token_amount: string
  id: number
  owner: string
  release_at: {
    at_time: string
  }
}

interface VaultPositionFlatAmounts {
  locked: BigNumber
  unlocking: BigNumber
  unlocked: BigNumber
}

interface DepositCap {
  denom: string
  used: BigNumber
  max: BigNumber
}

interface ProvideLiquidityAction {
  provide_liquidity: {
    account_id: string
    coins_in: import('../generated/mars-credit-manager/MarsCreditManager.types').ActionCoin[]
    lp_token_out: string
    minimum_receive: import('../generated/mars-credit-manager/MarsCreditManager.types').Uint128
  }
}

interface AprResponse {
  vaults: AprVault[]
}

interface AprVault {
  chain: string
  address: string
  apr: AprBreakdown
}

interface AprBreakdown {
  start_timestamp: number
  end_timestamp: number
  period_diff: number
  start_vault_token_price: number
  end_vault_token_price: number
  period_yield: number
  period_daily_return: number
  projected_apr: number
}

interface Apr {
  address: string
  apr: number
}
