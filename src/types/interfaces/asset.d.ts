interface Asset {
  color: string
  name: string
  denom: string
  symbol:
    | 'ATOM'
    | 'AXL'
    | 'INJ'
    | 'MARS'
    | 'OSMO'
    | 'stATOM'
    | 'stOSMO'
    | 'TIA'
    | 'USDC.axl'
    | 'USDC'
    | 'USDT'
    | 'WBTC.axl'
    | 'WETH.axl'
    | 'OSMO-USDC.n'
    | 'OSMO-ATOM'
    | 'OSMO-USDC.axl'
    | 'OSMO-WETH.axl'
    | 'OSMO-WBTC.axl'
    | 'stATOM-ATOM'
    | '$'
  id:
    | 'ATOM'
    | 'AXL'
    | 'INJ'
    | 'axlUSDC'
    | 'axlWBTC'
    | 'axlWETH'
    | 'MARS'
    | 'OSMO'
    | 'stATOM'
    | 'stOSMO'
    | 'TIA'
    | 'USD'
    | 'USDC'
    | 'USDT'
    | 'OSMO-USDC.n'
    | 'gamm/pool/12'
    | 'gamm/pool/1'
    | 'gamm/pool/678'
    | 'gamm/pool/704'
    | 'gamm/pool/712'
    | 'gamm/pool/803'
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
  isBorrowEnabled?: boolean
  pythPriceFeedId?: string
  pythHistoryFeedId?: string
  forceFetchPrice?: boolean
  testnetDenom?: string
  isStaking?: boolean
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
  borrowEnabled: boolean
}

interface MarketTableData {
  asset: Asset
  marketMaxLtv: number
  marketDepositAmount: BigNumber
  marketLiquidityRate: number
  marketLiquidityAmount: BigNumber
  marketLiquidationThreshold: number
}

interface HLSStrategy extends HLSStrategyNoCap {
  depositCap: DepositCap
}

interface HLSStrategyNoCap {
  maxLTV: number
  maxLeverage: number
  apy: number | null
  denoms: {
    deposit: string
    borrow: string
  }
}

interface DepositedHLSStrategy extends HLSStrategy {
  depositedAmount: BigNumber
}

interface StakingApr {
  chainId: string
  currentYield: number
  denom: string
  fees: number
  name: string
  strideYield: number
  unbondingDelay: number
  unbondingPeriod: number
}
