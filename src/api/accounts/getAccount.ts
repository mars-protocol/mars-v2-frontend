import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'types/classes/BNCoin'
import { Positions } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default async function getAccount(accountId: string): Promise<Account> {
  const creditManagerQueryClient = await getCreditManagerQueryClient()

  const accountPosition: Positions = await creditManagerQueryClient.positions({ accountId })

  if (accountPosition) {
    const debts = accountPosition.debts.map((debt) => new BNCoin(debt))
    const lends = accountPosition.lends.map((lend) => new BNCoin(lend))
    const deposits = accountPosition.deposits.map((deposit) => new BNCoin(deposit))

    return {
      id: accountPosition.account_id,
      debts,
      deposits,
      lends,
      vaults: accountPosition.vaults,
    }
  }

  return new Promise((_, reject) => reject('No account found'))
}
