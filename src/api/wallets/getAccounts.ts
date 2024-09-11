import { AccountKind } from '../../types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'
import getAccount from '../accounts/getAccount'
import getWalletAccountIds from './getAccountIds'

export default async function getAccounts(
  kind: AccountKind,
  chainConfig: ChainConfig,
  assets: Asset[],
  address?: string,
): Promise<Account[]> {
  if (!address) return new Promise((_, reject) => reject('No address'))
  const accountIdsAndKinds = await getWalletAccountIds(chainConfig, address)

  const $accounts = accountIdsAndKinds
    .filter((a) => a.kind === kind)
    .map((account) => getAccount(chainConfig, assets, account.id))

  const accounts = await Promise.all($accounts).then((accounts) => accounts)
  if (accounts) {
    return accounts.sort((a, b) => Number(a.id) - Number(b.id))
  }

  return new Promise((_, reject) => reject('No data'))
}
