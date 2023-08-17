import { AUTO_LEND_ENABLED_ACCOUNT_IDS_KEY } from 'constants/localStore'

export default function checkAutoLendEnabled(accountId: string) {
  const storageItem = localStorage.getItem(AUTO_LEND_ENABLED_ACCOUNT_IDS_KEY)
  const autoLendEnabledAccountIds: string[] = storageItem ? JSON.parse(storageItem) : []

  return autoLendEnabledAccountIds.includes(accountId)
}
