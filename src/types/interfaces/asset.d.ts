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
}

interface OtherAsset extends Omit<Asset, 'symbol'> {
  symbol: 'MARS'
}

interface BorrowAsset extends Asset {
  borrowRate: number | null
  liquidity: {
    amount: string
    value: string
  } | null
}

interface BorrowAssetActive extends BorrowAsset {
  debt: string
}
