import getAccount from 'api/accounts/getAccount'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getAccountDebts(accountId: string): Promise<BNCoin[]> {
  const account = await getAccount(accountId)

  if (account) {
    return account.debts.map((coin) => new BNCoin(coin))
  }

  return new Promise((_, reject) => reject('Account not found'))
}
