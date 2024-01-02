import useSWR from 'swr'

import getUnclaimedRewards from 'api/incentives/getUnclaimedRewards'
import useAccountId from 'hooks/useAccountId'
import useChainConfig from 'hooks/useChainConfig'
import { BNCoin } from 'types/classes/BNCoin'

export default function useUserUnclaimedRewards() {
  const accountId = useAccountId()
  const chainConfig = useChainConfig()

  return useSWR(
    `chains/${chainConfig.id}/accounts/${accountId}/unclaimed-rewards`,
    () => getUnclaimedRewards(chainConfig, accountId ?? ''),
    {
      fallbackData: [] as BNCoin[],
      isPaused: () => !accountId,
      revalidateOnFocus: false,
    },
  )
}
