import { LocalStorageKeys } from 'constants/localStorageKeys'

export function setAutoLendForAccount(chainId: string, accountId: string) {
  const key = `${chainId}/${LocalStorageKeys.AUTO_LEND_ENABLED_ACCOUNT_IDS}`
  const existingIds = JSON.parse(localStorage.getItem(key) || '[]')
  const updatedIds = Array.from(new Set([...existingIds, accountId]))
  localStorage.setItem(key, JSON.stringify(updatedIds))
}
