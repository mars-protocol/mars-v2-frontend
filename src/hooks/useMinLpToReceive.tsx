import useSWR from 'swr'

import getMinLpToReceive from 'api/vaults/getMinLpToReceive'
import { BN } from 'utils/helpers'

export default function useMinLpToReceive(coins: Coin[], lpDenom: string) {
  return useSWR(
    `minLpToReceive-${JSON.stringify(coins)}`,
    () => getMinLpToReceive(coins, lpDenom),
    {
      fallbackData: BN(0),
    },
  )
}
