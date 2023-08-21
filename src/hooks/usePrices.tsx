import useSWR from 'swr'

import getPrices from 'api/prices/getPrices'

export default function usePrices() {
  return useSWR('prices', getPrices, {
    fallbackData: [],
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  })
}
