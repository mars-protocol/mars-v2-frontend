import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'
import { BN } from 'utils/helpers'

export default async function getVaultConfigs(coins: Coin[], lpDenom: string): Promise<BigNumber> {
  if (!ENV.ADDRESS_CREDIT_MANAGER) return BN(0)

  const creditManagerQueryClient = await getCreditManagerQueryClient()
  try {
    return BN(
      await creditManagerQueryClient.estimateProvideLiquidity({
        coinsIn: coins,
        lpTokenOut: lpDenom,
      }),
    )
  } catch (ex) {
    throw ex
  }
}
