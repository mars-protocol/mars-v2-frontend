import { cacheFn, positionsCache } from 'api/cache'
import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { BNCoin } from 'types/classes/BNCoin'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default async function getAccount(
  chainConfig: ChainConfig,
  accountId?: string,
): Promise<Account> {
  if (!accountId) return new Promise((_, reject) => reject('No account ID found'))

  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

  const accountPosition: Positions = await cacheFn(
    () => creditManagerQueryClient.positions({ accountId: accountId }),
    positionsCache,
    `account/${accountId}`,
  )

  const accountKind = await creditManagerQueryClient.accountKind({ accountId: accountId })

  const depositedVaults = await getDepositedVaults(accountId, chainConfig, accountPosition)

  if (accountPosition) {
    return {
      id: accountPosition.account_id,
      debts: accountPosition.debts.map((debt) => new BNCoin(debt)),
      lends: accountPosition.lends.map((lend) => new BNCoin(lend)),
      deposits: accountPosition.deposits.map((deposit) => new BNCoin(deposit)),
      vaults: depositedVaults,
      perps: accountPosition.perps,
      kind: accountKind,
    }
  }

  return new Promise((_, reject) => reject('No account found'))
}
