import useLocalStorage from 'hooks/useLocalStorage'
import { AUTO_LEND_ENABLED_ACCOUNT_IDS_KEY } from 'constants/localStore'
import useCurrentAccount from 'hooks/useCurrentAccount'

function useAutoLendEnabledAccountIds(): {
  autoLendEnabledAccountIds: string[]
  toggleAutoLend: (accountId: string) => void
  isAutoLendEnabledForCurrentAccount: boolean
} {
  const currentAccount = useCurrentAccount()
  const [autoLendEnabledAccountIds, setAutoLendEnabledAccountIds] = useLocalStorage<string[]>(
    AUTO_LEND_ENABLED_ACCOUNT_IDS_KEY,
    [],
  )

  const toggleAutoLend = (accountId: string) => {
    const setOfAccountIds = new Set(autoLendEnabledAccountIds)

    setOfAccountIds.has(accountId)
      ? setOfAccountIds.delete(accountId)
      : setOfAccountIds.add(accountId)

    setAutoLendEnabledAccountIds(Array.from(setOfAccountIds))
  }

  const isAutoLendEnabledForCurrentAccount = currentAccount
    ? autoLendEnabledAccountIds.includes(currentAccount.id)
    : false

  return { autoLendEnabledAccountIds, toggleAutoLend, isAutoLendEnabledForCurrentAccount }
}

export default useAutoLendEnabledAccountIds
