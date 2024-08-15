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
  enableAutoLendForNewAccount: (accountId: string) => void
} {
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('default', address, false)
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

  const enableAutoLendForNewAccount = useCallback(
    (accountId: string) => {
      if (isAutoLendEnabledForCurrentAccount) {
        enableAutoLend(accountId)
      }
    },
    [isAutoLendEnabledForCurrentAccount, enableAutoLend],
  )

  return {
    autoLendEnabledAccountIds,
    enableAutoLend,
    disableAutoLend,
    isAutoLendEnabledForCurrentAccount,
    setAutoLendOnAllAccounts,
    enableAutoLendAccountId,
    enableAutoLendForNewAccount,
  }
}
