import { LocalStorageKeys } from 'constants/localStorageKeys'

export default function checkAutoLendEnabled(accountId: string, chainId: string) {
  const storageItem = localStorage.getItem(
    `${chainId}/${LocalStorageKeys.AUTO_LEND_ENABLED_ACCOUNT_IDS}`,
  )
  const autoLendEnabledAccountIds: string[] = storageItem ? JSON.parse(storageItem) : []

  return autoLendEnabledAccountIds.includes(accountId)
}
