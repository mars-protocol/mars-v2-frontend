import useSWR from 'swr'

import getUnclaimedRewards from 'api/incentives/getUnclaimedRewards'
import useAccountId from 'hooks/useAccountId'
import useChainConfig from 'hooks/useChainConfig'
import { BNCoin } from 'types/classes/BNCoin'

export default function useUserUnclaimedRewards() {
  const accountId = useAccountId()
  const chainConfig = useChainConfig()

  return useSWR(
    `userUnclaimedRewards-${accountId}`,
    () => getUnclaimedRewards(chainConfig, accountId ?? ''),
    {
      fallbackData: [] as BNCoin[],
      isPaused: () => !accountId,
      revalidateOnFocus: false,
    },
  )
}
