import { useMemo } from 'react'

import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'

export default function useCurrentAccount(): Account | undefined {
  const accountId = useAccountId()
  const { data: account } = useAccount(accountId || undefined)

  return useMemo(() => account, [account])
}
