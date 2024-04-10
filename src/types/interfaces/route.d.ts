type Page =
  | 'trade'
  | 'trade-advanced'
  | 'perps'
  | 'borrow'
  | 'farm'
  | 'lend'
  | 'portfolio'
  | 'portfolio/{accountId}'
  | 'hls-farm'
  | 'hls-staking'
  | 'governance'
  | 'execute'
  | 'v1'
  | 'arb'

type OsmosisRouteResponse = {
  amount_in: {
    denom: string
    amount: string
  }
  amount_out: string
  route: OsmosisRoute[]
  effective_fee: string
  price_impact: string
}

type OsmosisRoute = {
  pools: OsmosisRoutePool[]
  'has-cw-pool': boolean
  out_amount: string
  in_amount: string
}

type OsmosisRoutePool = {
  id: number
  type: number
  balances: []
  spread_factor: string
  token_out_denom: string
  taker_fee: string
}

type SwapRouteInfo = {
  priceImpact: BigNumber
  fee: BigNumber
  route: import('types/generated/mars-credit-manager/MarsCreditManager.types').SwapperRoute
  description: string
}

type AstroportRouteResponse = {
  id: string
  swaps: AstroportRoute[]
  denom_in: string
  decimals_in: number
  price_in: number
  value_in: string
  amount_in: string
  denom_out: string
  decimals_out: number
  price_out: number
  value_out: string
  amount_out: string
  price_difference: number
  price_impact: number
}

type AstroportRoute = {
  contract_addr: string
  from: string
  to: string
  type: string
  illiquid: boolean
}
