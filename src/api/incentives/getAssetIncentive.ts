import moment from 'moment'

import { ENV } from 'constants/env'
import { getClient } from 'api/cosmwasm-client'

export default async function getAssetIncentive(denom: string): Promise<AssetIncentive | null> {
  try {
    const client = await getClient()
    const assetIncentive = (await client.queryContractSmart(ENV.ADDRESS_INCENTIVES, {
      asset_incentive: {
        denom,
      },
    })) as AssetIncentive

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
