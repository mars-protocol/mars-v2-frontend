import { getSwapperQueryClient } from 'api/cosmwasm-client'
import { ZERO } from 'constants/math'
import { BN } from 'utils/helpers'

export default async function estimateExactIn(coinIn: Coin, denomOut: string) {
  try {
    const swapperClient = await getSwapperQueryClient()
    const estimatedAmount = (await swapperClient.estimateExactInSwap({ coinIn, denomOut })).amount

    return BN(estimatedAmount)
  } catch (ex) {
    return ZERO
  }
}
