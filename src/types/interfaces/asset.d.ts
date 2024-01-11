interface Asset extends AssetMetaData {
  denom: string
  poolId?: number
  isPerpsEnabled?: boolean
}

interface AssetMetaData {
  color: string
  decimals: number
  forceFetchPrice?: boolean
  hasOraclePrice: boolean
  id: string
  isAutoLendEnabled?: boolean
  isBorrowEnabled?: boolean
  isDisplayCurrency?: boolean
  isEnabled: boolean
  isFavorite?: boolean
  isMarket: boolean
  isStable?: boolean
  isStaking?: boolean
  logo: string
  name: string
  prefix?: string
  pythFeedName?: string
  pythPriceFeedId?: string
  symbol: string
  testnetDenom?: string
}

interface AssetPair {
  buy: Asset
  sell: Asset
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
  liquidity: {
    amount: BigNumber
    value: BigNumber
  } | null
  debt?: BigNumber
}

interface LendingMarketTableData extends MarketTableData {
  accountLentAmount?: string
  accountLentValue?: BigNumber
  borrowEnabled: boolean
  cap: DepositCap
}

interface MarketTableData {
  asset: Asset
  marketDepositAmount: BigNumber
  marketLiquidityAmount: BigNumber
  apy: {
    borrow: number
    deposit: number
  }
  ltv: {
    max: number
    liq: number
  }
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

interface PerpsMarket {
  asset: Asset
  fundingRate: BigNumber
  openInterest: {
    long: BigNumber
    short: BigNumber
  }
}
