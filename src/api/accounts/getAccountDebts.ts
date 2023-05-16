import getAccount from 'api/accounts/getAccount'

export default async function getAccountDebts(accountId: string): Promise<Coin[]> {
  const account = await getAccount(accountId)

  if (account) {
    return account.debts
  }

  return new Promise((_, reject) => reject('Account not found'))
}
