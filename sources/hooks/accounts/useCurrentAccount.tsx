import { useMemo } from 'react'

import useAccount from './useAccount'
import useAccountId from './useAccountId'

export default function useCurrentAccount(): Account | undefined {
  const accountId = useAccountId()
  const { data: account } = useAccount(accountId || undefined)

  return useMemo(() => account, [account])
}
