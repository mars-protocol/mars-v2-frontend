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
    perps: string
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
    explorer: string
    pools: string
    routes: string
    aprs: {
      vaults: string
      stride: string
    }
  }
  explorerName: string
  features: ('ibc-transfer' | 'ibc-go')[]
  gasPrice: string
  id: import('types/enums/wallet').ChainInfoID
  name: string
  network: 'mainnet' | 'testnet'
  vaults: VaultMetaData[]
  hls: boolean
  perps: boolean
  farm: boolean
}

interface ContractClients {
  accountNft: import('types/generated/mars-account-nft/MarsAccountNft.client').MarsAccountNftQueryClient
  creditManager: import('types/generated/mars-credit-manager/MarsCreditManager.client').MarsCreditManagerQueryClient
  incentives: import('types/generated/mars-incentives/MarsIncentives.client').MarsIncentivesQueryClient
  oracle: import('types/generated/mars-oracle-osmosis/MarsOracleOsmosis.client').MarsOracleOsmosisQueryClient
  params: import('types/generated/mars-params/MarsParams.client').MarsParamsQueryClient
  perps: import('types/generated/mars-perps/MarsPerps.client').MarsPerpsQueryClient
  redBank: import('types/generated/mars-red-bank/MarsRedBank.client').MarsRedBankQueryClient
  swapper: import('types/generated/mars-swapper-osmosis/MarsSwapperOsmosis.client').MarsSwapperOsmosisQueryClient
}
