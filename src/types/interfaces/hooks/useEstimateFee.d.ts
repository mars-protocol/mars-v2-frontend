interface UseEstimateFee {
  msg?: Record<string, unknown>
  funds?: import('@cosmjs/stargate').Coin[]
  contract?: string
  sender?: string
}
