import useAccounts from 'hooks/accounts/useAccounts'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAutoLendEnabledAccountIds from 'hooks/localStorage/useAutoLendEnabledAccountIds'
import { useCallback } from 'react'
import useStore from 'store'

export default function useAutoLend(): {
  autoLendEnabledAccountIds: string[]
  enableAutoLend: (accountId: string) => void
  disableAutoLend: (accountId: string) => void
  isAutoLendEnabledForCurrentAccount: boolean
  setAutoLendOnAllAccounts: (lendAssets: boolean) => void
  enableAutoLendAccountId: (accountId: string) => void
} {
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('all', address, false)
  const currentAccount = useCurrentAccount()
  const [autoLendEnabledAccountIds, setAutoLendEnabledAccountIds] = useAutoLendEnabledAccountIds()

  const enableAutoLend = useCallback(
    (accountId: string) => {
      const setOfAccountIds = new Set(autoLendEnabledAccountIds)
      setOfAccountIds.add(accountId)
      setAutoLendEnabledAccountIds(Array.from(setOfAccountIds))
    },
    [autoLendEnabledAccountIds, setAutoLendEnabledAccountIds],
  )

  const disableAutoLend = useCallback(
    (accountId: string) => {
      const setOfAccountIds = new Set(autoLendEnabledAccountIds)
      setOfAccountIds.delete(accountId)
      setAutoLendEnabledAccountIds(Array.from(setOfAccountIds))
    },
    [autoLendEnabledAccountIds, setAutoLendEnabledAccountIds],
  )

  const isAutoLendEnabledForCurrentAccount = currentAccount
    ? autoLendEnabledAccountIds.includes(currentAccount.id)
    : false

  const setAutoLendOnAllAccounts = useCallback(
    (lendAssets: boolean) => {
      const allAccountIds = accounts ? accounts.map((account) => account.id) : []
      setAutoLendEnabledAccountIds(lendAssets ? allAccountIds : [])
    },
    [accounts, setAutoLendEnabledAccountIds],
  )

  const enableAutoLendAccountId = useCallback(
    (accountId: string) => {
      const setOfAccountIds = new Set(autoLendEnabledAccountIds)

      if (!setOfAccountIds.has(accountId)) setOfAccountIds.add(accountId)
      setAutoLendEnabledAccountIds(Array.from(setOfAccountIds))
    },
    [autoLendEnabledAccountIds, setAutoLendEnabledAccountIds],
  )

  return {
    autoLendEnabledAccountIds,
    enableAutoLend,
    disableAutoLend,
    isAutoLendEnabledForCurrentAccount,
    setAutoLendOnAllAccounts,
    enableAutoLendAccountId,
  }
}
