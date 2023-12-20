interface ChainConfig {
  assets: Asset[]
  bech32Config: import('@keplr-wallet/types').Bech32Config
  contracts: {
    redBank: string
    incentives: string
    oracle: string
    swapper: string
    params: string
    creditManager: string
    accountNft: string
    perps?: string
    pyth: string
  }
  defaultCurrency: {
    coinDenom: string
    coinMinimalDenom: string
    coinDecimals: number
    coinGeckoId: string
    gasPriceStep: {
      low: number
      average: number
      high: number
    }
  }
  endpoints: {
    rest: string
    rpc: string
    swap: string
    pyth: string
    explorer: string
    pools: string
    aprs: {
      vaults: string
      stride: string
    }
  }
  explorerName: string
  features: ('ibc-transfer' | 'ibc-go')[]
  gasPrice: string
  id: string
  name: string
  network: 'mainnet' | 'devnet'
  vaults: VaultMetaData[]
}
