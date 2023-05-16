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
    used: number
    max: number
  }
}

interface VaultConfig extends VaultMetaData, VaultInfo {}

interface Vault extends VaultConfig {
  apy: number | null
}

interface ActiveVault extends Vault {
  status: 'active' | 'unlocking' | 'unlocked'
  amounts: {
    primary: number
    secondary: number
  }
  values: {
    primary: number
    secondary: number
  }
  unlocksAt?: number
}
