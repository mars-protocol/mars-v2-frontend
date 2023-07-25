import useSWR from 'swr'

import getSwapRoute from 'api/swap/getSwapRoute'

export default function useSwapRoute(denomIn: string, denomOut: string) {
  return useSWR(`swapRoute-${denomIn}-${denomOut}`, () => getSwapRoute(denomIn, denomOut), {
    fallbackData: [],
  })
}
