import useSWR from 'swr'

import getSwapRoute from 'api/swap/getSwapRoute'
import useChainConfig from 'hooks/useChainConfig'

export default function useSwapRoute(denomIn: string, denomOut: string) {
  const chainConfig = useChainConfig()
  return useSWR(
    `swapRoute-${denomIn}-${denomOut}`,
    () => getSwapRoute(chainConfig, denomIn, denomOut),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
