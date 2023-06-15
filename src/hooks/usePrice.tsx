import usePrices from 'hooks/usePrices'

export default function usePrice(denom: string) {
  const { data: prices } = usePrices()

  return prices.find((coin) => coin.denom === denom)?.amount ?? 0
}
