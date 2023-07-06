import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'
import { BN } from 'utils/helpers'

export default async function getVaultConfigs(
  coins: Coin[],
  lpDenom: string,
  slippage: number,
): Promise<BigNumber> {
  if (!ENV.ADDRESS_CREDIT_MANAGER) return BN(Infinity)

  const creditManagerQueryClient = await getCreditManagerQueryClient()
  try {
    return BN(
      await creditManagerQueryClient.estimateProvideLiquidity({
        coinsIn: coins,
        lpTokenOut: lpDenom,
      }),
    )
      .multipliedBy(1 - slippage)
      .integerValue()
  } catch (ex) {
    throw ex
  }
}
