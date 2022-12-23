interface NetworkConfig {
  name: string
  hiveUrl: string
  rpcUrl: string
  restUrl: string
  contracts: {
    accountNft: string
    mockVault: string
    marsOracleAdapter: string
    swapper: string
    mockZapper: string
    creditManager: string
    redBank: string
    oracle: string
  }
  assets: {
    base: Asset
    whitelist: Asset[]
    other: OtherAsset[]
  }
  appUrl: string
}
