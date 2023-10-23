import { LocalStorageKeys } from 'constants/localStorageKeys'

export default function checkAutoLendEnabled(accountId: string) {
  const storageItem = localStorage.getItem(LocalStorageKeys.AUTO_LEND_ENABLED_ACCOUNT_IDS)
  const autoLendEnabledAccountIds: string[] = storageItem ? JSON.parse(storageItem) : []

  return autoLendEnabledAccountIds.includes(accountId)
}
