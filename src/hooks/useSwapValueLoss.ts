import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import estimateExactIn from 'api/swap/estimateExactIn'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { BN } from 'utils/helpers'

const amountIn = 1000_000_000

export default function useSwapValueLoss(denomIn: string, denomOut: string) {
  const denomInPrice = usePrice(denomIn)
  const denomOutPrice = usePrice(denomOut)

  return useSWR(
    `swapValueLoss/${denomIn}/${denomOut}`,
    async () => {
      const valueIn = denomInPrice.times(amountIn)
      const amountOut = await estimateExactIn(
        BNCoin.fromDenomAndBigNumber(denomIn, BN(amountIn)).toCoin(),
        denomOut,
      )
      const valueOut = denomOutPrice.times(amountOut)

      return BigNumber.max(
        valueIn.minus(valueOut).dividedBy(valueIn).decimalPlaces(6),
        0,
      ).toNumber()
    },
    {
      fallbackData: SWAP_FEE_BUFFER,
    },
  )
}
