import { cacheFn, unclaimedRewardsCache } from 'api/cache'
import { getIncentivesQueryClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'
import { BNCoin } from 'types/classes/BNCoin'
import iterateContractQuery from 'utils/iterateContractQuery'

export default async function getUnclaimedRewards(accountId: string): Promise<BNCoin[]> {
  try {
    const client = await getIncentivesQueryClient()
    const unclaimedRewards = await cacheFn(
      () =>
        iterateContractQuery(() =>
          client.userUnclaimedRewards({
            user: ENV.ADDRESS_CREDIT_MANAGER,
            accountId,
          }),
        ),
      unclaimedRewardsCache,
      `incentives/${accountId}`,
      60,
    )

    if (unclaimedRewards.length === 0) return []

    return await Promise.all(
      unclaimedRewards.map((reward) => new BNCoin({ denom: reward.denom, amount: reward.amount })),
    )
  } catch (ex) {
    return []
  }
}
