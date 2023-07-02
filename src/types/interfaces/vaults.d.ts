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
  cap: {
    denom: string
    used: BigNumber
    max: BigNumber
  }
}

interface VaultConfig extends VaultMetaData, VaultInfo {}

interface Vault extends VaultConfig {
  apy: number | null
}

interface VaultValuesAndAmounts {
  amounts: {
    primary: BigNumber
    secondary: BigNumber
    locked: BigNumber
    unlocked: BigNumber
    unlocking: BigNumer
  }
  values: {
    primary: BigNumber
    secondary: BigNumber
  }
}

type VaultStatus = 'active' | 'unlocking' | 'unlocked'
interface DepositedVault extends Vault, VaultValuesAndAmounts {
  status: VaultStatus
  positionId?: number
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
