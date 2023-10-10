import getAccount from 'api/accounts/getAccount'
import getWalletAccountIds from 'api/wallets/getAccountIds'

export default async function getAccounts(address?: string): Promise<Account[]> {
  if (!address) return []
  const accountIds: string[] = await getWalletAccountIds(address)

  const $accounts = accountIds.map((accountId) => getAccount(accountId))

  const accounts = await Promise.all($accounts).then((accounts) => accounts)

  if (accounts) {
    return accounts.sort((a, b) => Number(a.id) - Number(b.id))
  }

  return new Promise((_, reject) => reject('No data'))
}
