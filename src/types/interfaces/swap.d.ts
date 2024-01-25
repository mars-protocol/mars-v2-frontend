export interface AstroportSwapRouteResponse {
  amount_in: string
  amount_out: string
  decimals_in: number
  decimals_out: number
  denom_in: string
  denom_out: string
  id: string
  price_difference: number
  price_impact: number
  price_in: number
  price_out: number
  swaps: Swap[]
  value_in: string
  value_out: string
}

export interface AstroportSwapResponse {
  contract_addr: string
  from: string
  illiquid: boolean
  to: string
  type: SwapPoolType
}

export enum AstroportSwapPoolType {
  XYK = 'xyk',
  PCL = 'pcl',
}
