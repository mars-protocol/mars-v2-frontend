import getWalletAccountIds from 'api/wallets/getAccountIds'
import getAccount from 'api/accounts/getAccount'

export default async function getAccounts(address: string): Promise<Account[]> {
  const accountIds: string[] = await getWalletAccountIds(address)

  const $accounts = accountIds.map((accountId) => getAccount(accountId))

  const accounts = await Promise.all($accounts).then((accounts) => accounts)

  if (accounts) {
    return accounts
  }

  return new Promise((_, reject) => reject('No data'))
}
