import useSWR from 'swr'

import getPrices from 'api/prices/getPrices'
import useStore from 'store'

export default function usePrices() {
  return useSWR('prices', getPrices, {
    fallbackData: [],
    refreshInterval: 30000,
    onSuccess: (prices) => useStore.setState({ prices }),
  })
}
