import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import { useMemo } from 'react'

export default function useCurrentAccount(): Account | undefined {
  const accountId = useAccountId()
  const { data: account } = useAccount(accountId)

  return useMemo(() => account, [account])
}
