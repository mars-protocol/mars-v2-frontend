import useAutoLendEnabledAccountIds from 'hooks/localStorage/useAutoLendEnabledAccountIds'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

export default function useAutoLend(): {
  autoLendEnabledAccountIds: string[]
  enableAutoLend: (accountId: string) => void
  disableAutoLend: (accountId: string) => void
  isAutoLendEnabledForCurrentAccount: boolean
  setAutoLendOnAllAccounts: (lendAssets: boolean) => void
  enableAutoLendAccountId: (accountId: string) => void
} {
  const accounts = useStore((s) => s.accounts)
  const currentAccount = useCurrentAccount()
  const [autoLendEnabledAccountIds, setAutoLendEnabledAccountIds] = useAutoLendEnabledAccountIds()

  const enableAutoLend = (accountId: string) => {
    const setOfAccountIds = new Set(autoLendEnabledAccountIds)
    setOfAccountIds.add(accountId)
    setAutoLendEnabledAccountIds(Array.from(setOfAccountIds))
  }

  const disableAutoLend = (accountId: string) => {
    const setOfAccountIds = new Set(autoLendEnabledAccountIds)
    setOfAccountIds.delete(accountId)
    setAutoLendEnabledAccountIds(Array.from(setOfAccountIds))
  }

  const isAutoLendEnabledForCurrentAccount = currentAccount
    ? autoLendEnabledAccountIds.includes(currentAccount.id)
    : false

  const setAutoLendOnAllAccounts = (lendAssets: boolean) => {
    const allAccountIds = accounts ? accounts.map((account) => account.id) : []
    setAutoLendEnabledAccountIds(lendAssets ? allAccountIds : [])
  }

  const enableAutoLendAccountId = (accountId: string) => {
    const setOfAccountIds = new Set(autoLendEnabledAccountIds)

    if (!setOfAccountIds.has(accountId)) setOfAccountIds.add(accountId)
    setAutoLendEnabledAccountIds(Array.from(setOfAccountIds))
  }

  return {
    autoLendEnabledAccountIds,
    enableAutoLend,
    disableAutoLend,
    isAutoLendEnabledForCurrentAccount,
    setAutoLendOnAllAccounts,
    enableAutoLendAccountId,
  }
}
