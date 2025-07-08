import useSWR from 'swr'

import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { useMemo } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import iterateContractQuery from 'utils/iterateContractQuery'

export default function useUserUnclaimedRewards() {
  const isV1 = useStore((s) => s.isV1)
  const accountId = useAccountId()
  const chainConfig = useChainConfig()
  const clients = useClients()
  const address = useStore((s) => s.address)

  const enabled = useMemo(
    () => (isV1 ? !!clients && !!address : !!accountId && !!clients),
    [isV1, clients, address, accountId],
  )
  const key = isV1
    ? `chains/${chainConfig.id}/v1/user/${address}/unclaimed-rewards`
    : `chains/${chainConfig.id}/accounts/${accountId}/unclaimed-rewards`

  return useSWR(enabled && key, () => getUnclaimedRewards(clients!, accountId!, address!, isV1), {
    refreshInterval: 60_000,
    fallbackData: [] as BNCoin[],
    isPaused: () => !enabled,
    revalidateOnFocus: false,
  })
}

async function getUnclaimedRewards(
  clients: ContractClients,
  accountId: string,
  address: string,
  isV1: boolean,
): Promise<BNCoin[]> {
  try {
    const unclaimedRewards = await iterateContractQuery(() =>
      clients.incentives.userUnclaimedRewards({
        user: isV1 ? address : clients.creditManager.contractAddress,
        accountId: isV1 ? undefined : accountId,
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
