import useAccountId from 'hooks/useAccountId'
import useStore from 'store'

export default function useCurrentAccount(): Account | undefined {
  const accountId = useAccountId()

  const accounts = useStore((s) => s.accounts)
  return accounts?.find((account) => account.id === accountId)
}
