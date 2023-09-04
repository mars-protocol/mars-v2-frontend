interface Asset {
  color: string
  name: string
  denom: string
  mainnetDenom: string
  symbol:
    | 'OSMO'
    | 'ATOM'
    | 'MARS'
    | 'stATOM'
    | 'USDC.axl'
    | 'USDC.n'
    | 'WBTC.axl'
    | 'WETH.axl'
    | 'OSMO-USDC.n'
    | '$'
    | 'OSMO-ATOM'
  id:
    | 'OSMO'
    | 'ATOM'
    | 'MARS'
    | 'stATOM'
    | 'axlUSDC'
    | 'axlWBTC'
    | 'axlWETH'
    | 'nUSDC'
    | 'OSMO-USDC.n'
    | 'USD'
    | 'gamm/pool/12'
  prefix?: string
  contract_addr?: string
  logo: string
  decimals: number
  hasOraclePrice: boolean
  poolId?: number
  isEnabled: boolean
  isMarket: boolean
  isDisplayCurrency?: boolean
  isStable?: boolean
  isFavorite?: boolean
  isAutoLendEnabled?: boolean
  pythPriceFeedId?: string
  forceFetchPrice?: boolean
  testnetDenom?: string
}

interface PseudoAsset {
  decimals: number
  symbol: string
}

interface BorrowAsset extends Asset {
  borrowRate: number | null
  liquidity: {
    amount: BigNumber
    value: BigNumber
  } | null
}

interface BigNumberCoin {
  denom: string
  amount: BigNumber
}

interface BorrowMarketTableData extends MarketTableData {
  borrowRate: number | null
  liquidity: {
    amount: BigNumber
    value: BigNumber
  } | null
  debt?: BigNumber
}

interface LendingMarketTableData extends MarketTableData {
  marketDepositCap: BigNumber
  accountLentAmount?: string
  accountLentValue?: BigNumber
}

interface MarketTableData {
  asset: Asset
  marketMaxLtv: number
  marketDepositAmount: BigNumber
  marketLiquidityRate: number
  marketLiquidityAmount: BigNumber
  marketLiquidationThreshold: number
}
