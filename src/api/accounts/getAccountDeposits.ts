import getAccount from 'api/accounts/getAccount'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getAccountDeposits(accountId: string): Promise<BNCoin[]> {
  const account = await getAccount(accountId)

  if (account) {
    return account.deposits
  }

  return new Promise((_, reject) => reject('Account not found'))
}
