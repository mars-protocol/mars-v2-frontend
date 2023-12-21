import { getSwapperQueryClient } from 'api/cosmwasm-client'
import { BN_ZERO } from 'constants/math'
import { BN } from 'utils/helpers'

export default async function estimateExactIn(
  chainConfig: ChainConfig,
  coinIn: Coin,
  denomOut: string,
) {
  try {
    const swapperClient = await getSwapperQueryClient(chainConfig)
    const estimatedAmount = (await swapperClient.estimateExactInSwap({ coinIn, denomOut })).amount

    return BN(estimatedAmount)
  } catch (ex) {
    return BN_ZERO
  }
}
