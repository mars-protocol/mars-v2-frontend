import { getIncentivesQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getUnclaimedRewards(
  user: string,
  accountId: string,
): Promise<BNCoin[]> {
  try {
    const client = await getIncentivesQueryClient()
    const unclaimedRewards = await client.userUnclaimedRewards({
      user,
      accountId,
      limit: 100,
    })

    if (unclaimedRewards.length === 0) return []

    return await Promise.all(
      unclaimedRewards.map((reward) => new BNCoin({ denom: reward.denom, amount: reward.amount })),
    )
  } catch (ex) {
    return []
  }
}
