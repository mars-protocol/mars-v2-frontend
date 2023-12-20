import { cacheFn, emissionsCache } from 'api/cache'
import { getIncentivesQueryClient } from 'api/cosmwasm-client'
import getPrice from 'api/prices/getPrice'
import { BN_ZERO } from 'constants/math'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default async function getTotalActiveEmissionValue(
  chainConfig: ChainConfig,
  denom: string,
): Promise<BigNumber | null> {
  try {
    const client = await getIncentivesQueryClient(chainConfig.endpoints.rpc)
    const activeEmissions = await cacheFn(
      () =>
        client.activeEmissions({
          collateralDenom: denom,
        }),
      emissionsCache,
      `emission/${denom}`,
      60,
    )

    if (activeEmissions.length === 0) {
      throw 'Asset has no active incentive emission.'
    }

    const prices = await Promise.all(
      activeEmissions.map((activeEmission) => getPrice(chainConfig, activeEmission.denom)),
    )

    return activeEmissions.reduce((accumulation, current, index) => {
      const price = prices[index]
      const decimals = chainConfig.assets.find(byDenom(current.denom))?.decimals as number
      const emissionValue = BN(current.emission_rate).shiftedBy(-decimals).multipliedBy(price)

      return accumulation.plus(emissionValue)
    }, BN_ZERO)
  } catch (ex) {
    return null
  }
}
