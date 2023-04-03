interface Asset {
  color: string
  name: string
  denom: string
  symbol: 'OSMO' | 'ATOM' | 'CRO' | 'MARS' | 'JUNO'
  prefix?: string
  contract_addr?: string
  logo: string
  decimals: number
  hasOraclePrice: boolean
  poolId?: number
  isEnabled: boolean
  isMarket: boolean
}

interface OtherAsset extends Omit<Asset, 'symbol'> {
  symbol: 'MARS'
}

interface BorrowAsset {
  denom: string
  borrowRate: number | null
  liquidity: {
    amount: string
    value: string
  } | null
}

interface BorrowAssetActive extends BorrowAsset {
  debt: string
}
