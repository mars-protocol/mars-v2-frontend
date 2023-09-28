import { cacheFn, emissionsCache } from 'api/cache'
import { getIncentivesQueryClient } from 'api/cosmwasm-client'
import getPrice from 'api/prices/getPrice'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default async function getTotalActiveEmissionValue(
  denom: string,
): Promise<BigNumber | null> {
  try {
    const client = await getIncentivesQueryClient()
    const activeEmissions = await cacheFn(
      () =>
        client.activeEmissions({
          collateralDenom: denom,
        }),
      emissionsCache,
      denom,
      60,
    )

    if (activeEmissions.length === 0) {
      throw 'Asset has no active incentive emission.'
    }

    const prices = await Promise.all(
      activeEmissions.map((activeEmission) => getPrice(activeEmission.denom)),
    )

    return activeEmissions.reduce((accumulation, current, index) => {
      const price = prices[index]
      const decimals = ASSETS.find(byDenom(current.denom))?.decimals as number
      const emissionValue = BN(current.emission_rate).shiftedBy(-decimals).multipliedBy(price)

      return accumulation.plus(emissionValue)
    }, BN_ZERO)
  } catch (ex) {
    return null
  }
}
