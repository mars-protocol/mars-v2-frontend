import getAccount from 'api/accounts/getAccount'
import getWalletAccountIds from 'api/wallets/getAccountIds'
import { checkAccountKind } from 'utils/accounts'

export default async function getAccounts(
  kind: AccountKind | 'fund_manager' | 'all',
  chainConfig: ChainConfig,
  assets: Asset[],
  address?: string,
): Promise<Account[]> {
  if (!address) return new Promise((_, reject) => reject('No address'))
  const allAccountIds = await getWalletAccountIds(chainConfig, address)

  const $accounts =
    kind === 'all'
      ? allAccountIds.map((a) => getAccount(chainConfig, assets, a.id, address))
      : allAccountIds
          .filter((a) => {
            return checkAccountKind(a.kind) === kind
          })
          .map((a) => getAccount(chainConfig, assets, a.id, address))

  const accounts = await Promise.all($accounts).then((accounts) => accounts)
  if (accounts) {
    return accounts.sort((a, b) => Number(a.id) - Number(b.id))
  }

  return new Promise((_, reject) => reject('No data'))
}
