import moment from 'moment'

import { getIncentivesQueryClient } from 'api/cosmwasm-client'
import { AssetIncentiveResponse } from 'types/generated/mars-incentives/MarsIncentives.types'

export default async function getAssetIncentive(
  denom: string,
): Promise<AssetIncentiveResponse | null> {
  try {
    const client = await getIncentivesQueryClient()
    const assetIncentive = await client.assetIncentive({
      denom,
    })

    const { duration, start_time } = assetIncentive
    const isValid = moment(start_time + duration).isBefore(moment.now())

    if (!isValid) {
      throw 'Asset incentive duration is end.'
    }

    return assetIncentive
  } catch (ex) {
    console.error(ex)
    return null
  }
}
