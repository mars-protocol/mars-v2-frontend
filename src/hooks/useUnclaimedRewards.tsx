import useSWR from 'swr'

import useAccountId from 'hooks/useAccountId'
import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import { BNCoin } from 'types/classes/BNCoin'
import iterateContractQuery from 'utils/iterateContractQuery'

export default function useUserUnclaimedRewards() {
  const accountId = useAccountId()
  const chainConfig = useChainConfig()
  const clients = useClients()

  const enabled = !!accountId && !!clients

  return useSWR(
    enabled && `chains/${chainConfig.id}/accounts/${accountId}/unclaimed-rewards`,
    () => getUnclaimedRewards(clients!, accountId!),
    {
      fallbackData: [] as BNCoin[],
      isPaused: () => !accountId,
      revalidateOnFocus: false,
    },
  )
}

async function getUnclaimedRewards(clients: ContractClients, accountId: string): Promise<BNCoin[]> {
  try {
    const unclaimedRewards = await iterateContractQuery(() =>
      clients.incentives.userUnclaimedRewards({
        user: clients.creditManager.contractAddress,
        accountId,
      }),
    )

    if (unclaimedRewards.length === 0) return []

    return await Promise.all(
      unclaimedRewards.map((reward) => new BNCoin({ denom: reward.denom, amount: reward.amount })),
    )
  } catch (ex) {
    return []
  }
}
