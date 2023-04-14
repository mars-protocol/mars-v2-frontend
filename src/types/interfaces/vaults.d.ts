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
}

interface VaultConfig extends VaultMetaData {
  ltv: {
    max: number
    liq: number
  }
  cap: {
    denom: string
    used: numnber
    max: number
  }
}

interface Vault extends VaultConfig {
  apy: number | null
}
