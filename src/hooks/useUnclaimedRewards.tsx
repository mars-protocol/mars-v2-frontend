import useSWR from 'swr'

import getUnclaimedRewards from 'api/incentives/getUnclaimedRewards'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

export default function useUserUnclaimedRewards() {
  const user = useStore((s) => s.address)
  const account = useCurrentAccount()

  return useSWR(
    `userUnclaimedRewards-${account?.id}`,
    () => getUnclaimedRewards(user ?? '', account?.id ?? ''),
    {
      fallbackData: [] as BNCoin[],
      refreshInterval: 10_000,
      isPaused: () => !account?.id || !user,
      revalidateOnFocus: false,
    },
  )
}
