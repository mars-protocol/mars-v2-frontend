import useSWR from 'swr'

import getAccountDebts from 'api/accounts/getAccountDebts'

export default function useAccountDebts(accountId?: string) {
  return useSWR(`accountDebts${accountId}`, () => getAccountDebts(accountId || ''), {
    suspense: true,
    isPaused: () => !accountId,
  })
}
