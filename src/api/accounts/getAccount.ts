import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getAccount(accountId: string): Promise<Account> {
  const creditManagerQueryClient = await getCreditManagerQueryClient()

  const accountPosition: Positions = await creditManagerQueryClient.positions({ accountId })

  const depositedVaults = await getDepositedVaults(accountId)

  if (accountPosition) {
    return {
      id: accountPosition.account_id,
      debts: accountPosition.debts.map((debt) => new BNCoin(debt)),
      lends: accountPosition.lends.map((lend) => new BNCoin(lend)),
      deposits: accountPosition.deposits.map((deposit) => new BNCoin(deposit)),
      vaults: depositedVaults,
    }
  }

  return new Promise((_, reject) => reject('No account found'))
}
