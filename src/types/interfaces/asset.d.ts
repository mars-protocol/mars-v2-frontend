interface Asset {
  color: string
  name: string
  denom: string
  symbol: 'OSMO' | 'ATOM' | 'MARS' | 'stATOM' | 'USDC.axl' | 'USDC.n' | 'WBTC.axl' | 'WETH.axl'
  id: 'OSMO' | 'ATOM' | 'MARS' | 'stATOM' | 'axlUSDC' | 'axlWBTC' | 'axlWETH' | 'nUSDC'
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
}

interface PseudoAsset {
  decimals: number
  symbol: string
}

interface OtherAsset extends Omit<Asset, 'symbol'> {
  symbol: 'MARS'
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
