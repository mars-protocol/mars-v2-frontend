interface Asset {
  color: string
  name: string
  denom: string
  symbol: 'OSMO' | 'ATOM' | 'CRO'
  contract_addr?: string
  logo: string
  decimals: number
  hasOraclePrice: boolean
  poolId?: number
}

interface OtherAsset extends Omit<Asset, 'symbol'> {
  symbol: 'MARS'
}
