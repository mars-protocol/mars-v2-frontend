import { useMemo } from 'react'

import useAccounts from 'hooks/accounts/useAccounts'
import useAccountId from 'hooks/useAccountId'

export default function useCurrentAccount(): Account | undefined {
  const accountId = useAccountId()
  const { data: accounts } = useAccounts('default', undefined, false)

  return useMemo(() => accounts?.find((account) => account.id === accountId), [accountId, accounts])
}
