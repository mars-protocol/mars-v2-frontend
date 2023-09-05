import { AUTO_LEND_ENABLED_ACCOUNT_IDS_KEY } from 'constants/localStore'
import useAccounts from 'hooks/useAccounts'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'

export default function useAutoLend(): {
  autoLendEnabledAccountIds: string[]
  toggleAutoLend: (accountId: string) => void
  isAutoLendEnabledForCurrentAccount: boolean
  setAutoLendOnAllAccounts: (lendAssets: boolean) => void
  enableAutoLendAccountId: (accountId: string) => void
} {
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts(address)
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

  const setAutoLendOnAllAccounts = (lendAssets: boolean) => {
    const allAccountIds = accounts.map((account) => account.id)
    setAutoLendEnabledAccountIds(lendAssets ? allAccountIds : [])
  }

  const enableAutoLendAccountId = (accountId: string) => {
    const setOfAccountIds = new Set(autoLendEnabledAccountIds)

    if (!setOfAccountIds.has(accountId)) setOfAccountIds.add(accountId)
  }

  return {
    autoLendEnabledAccountIds,
    toggleAutoLend,
    isAutoLendEnabledForCurrentAccount,
    setAutoLendOnAllAccounts,
    enableAutoLendAccountId,
  }
}
