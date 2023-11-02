import useSWR from 'swr'

import getPricesData from 'api/prices/getPriceData'

export default function usePricesData() {
  return useSWR('pricesData', getPricesData, {
    fallbackData: [],
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  })
}
