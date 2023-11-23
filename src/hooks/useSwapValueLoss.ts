import useSWR from 'swr'

import estimateExactIn from 'api/swap/estimateExactIn'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { BN } from 'utils/helpers'

export default function useSwapValueLoss(
  denomIn: string,
  denomOut: string,
  amount: number = 1_000_000,
) {
  const denomInPrice = usePrice(denomIn)
  const denomOutPrice = usePrice(denomOut)

  return useSWR(
    `swapValueLoss/${denomIn}/${denomOut}/${amount}`,
    async () => {
      const valueIn = denomInPrice.times(amount)
      const amountOut = await estimateExactIn(
        BNCoin.fromDenomAndBigNumber(denomIn, BN(amount)).toCoin(),
        denomOut,
      )
      const valueOut = denomOutPrice.times(amountOut)

      return valueIn.minus(valueOut).dividedBy(valueIn).decimalPlaces(6).toNumber()
    },
    {
      fallbackData: SWAP_FEE_BUFFER,
    },
  )
}
