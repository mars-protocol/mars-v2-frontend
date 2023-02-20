interface Asset {
  color: string
  name: string
  denom: string
  symbol: 'OSMO' | 'ATOM' | 'CRO' | 'MARS' | 'JUNO'
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
