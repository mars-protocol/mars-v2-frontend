import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import getAccount from './getAccount'

export default async function getAccountDeposits(accountId: string) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER || !ENV.URL_API) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

  const account = await getAccount(accountId)

  if (account) {
    return account.vaults
  }

  return new Promise((_, reject) => reject('Account not found'))
}
