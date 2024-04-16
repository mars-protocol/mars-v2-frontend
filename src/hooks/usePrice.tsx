import { BN_ZERO } from 'constants/math'
import usePrices from 'hooks/usePrices'

export default function usePrice(denom: string) {
  const { data: prices } = usePrices()

  return prices.find((coin) => coin.denom === denom)?.amount ?? BN_ZERO
}
