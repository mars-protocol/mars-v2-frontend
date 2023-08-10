import { getIncentivesQueryClient } from 'api/cosmwasm-client'
import { ActiveEmission } from 'types/generated/mars-incentives/MarsIncentives.types'

export default async function getAssetIncentive(denom: string): Promise<ActiveEmission | null> {
  try {
    const client = await getIncentivesQueryClient()
    const activeEmissions = await client.activeEmissions({
      collateralDenom: denom,
    })

    if (activeEmissions.length === 0) {
      throw 'Asset has no active incentive emission.'
    }

    return activeEmissions[0]
  } catch (ex) {
    console.error(ex)
    return null
  }
}
