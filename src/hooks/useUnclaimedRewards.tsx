import useSWR from 'swr'

import getUnclaimedRewards from 'api/incentives/getUnclaimedRewards'
import useAccountId from 'hooks/useAccountId'
import { BNCoin } from 'types/classes/BNCoin'

export default function useUserUnclaimedRewards() {
  const accountId = useAccountId()

  return useSWR(`userUnclaimedRewards-${accountId}`, () => getUnclaimedRewards(accountId ?? ''), {
    fallbackData: [] as BNCoin[],
    isPaused: () => !accountId,
    revalidateOnFocus: false,
  })
}
