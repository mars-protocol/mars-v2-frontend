import getAccount from 'api/accounts/getAccount'

export default async function getAccountDeposits(accountId: string) {
  const account = await getAccount(accountId)

  if (account) {
    return account.vaults
  }

  return new Promise((_, reject) => reject('Account not found'))
}
