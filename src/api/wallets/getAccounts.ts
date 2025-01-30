import getAccount from 'api/accounts/getAccount'
import getWalletAccountIds from 'api/wallets/getAccountIds'

export default async function getAccounts(
  kind: AccountKind | 'fund_manager',
  chainConfig: ChainConfig,
  assets: Asset[],
  address?: string,
): Promise<Account[]> {
  if (!address) return new Promise((_, reject) => reject('No address'))
  const accountIdsAndKinds = await getWalletAccountIds(chainConfig, address)

  const $accounts = accountIdsAndKinds
    .filter((a) => {
      if (kind === 'fund_manager') {
        return typeof a.kind === 'object' && 'fund_manager' in a.kind
      }
      return a.kind === kind
    })
    .map((account) => getAccount(chainConfig, assets, account.id, address))

  const accounts = await Promise.all($accounts).then((accounts) => accounts)
  if (accounts) {
    return accounts.sort((a, b) => Number(a.id) - Number(b.id))
  }

  return new Promise((_, reject) => reject('No data'))
}
