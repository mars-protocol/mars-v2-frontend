import { cacheFn, userCollateralCache, userDebtCache } from 'api/cache'
import { getRedBankQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'types/classes/BNCoin'
import {
  ArrayOfUserCollateralResponse,
  ArrayOfUserDebtResponse,
} from 'types/generated/mars-red-bank/MarsRedBank.types'

export default async function getV1Positions(
  chainConfig: ChainConfig,
  user?: string,
): Promise<Account> {
  if (!user) return new Promise((_, reject) => reject('No account Wallet ID found'))

  const redBankQueryClient = await getRedBankQueryClient(chainConfig)

  const userCollateral: ArrayOfUserCollateralResponse = await cacheFn(
    () => redBankQueryClient.userCollaterals({ user: user, limit: 100 }),
    userCollateralCache,
    `${chainConfig.id}/v1/deposits/${user}`,
  )
  const userDebt: ArrayOfUserDebtResponse = await cacheFn(
    () => redBankQueryClient.userDebts({ user: user, limit: 100 }),
    userDebtCache,
    `${chainConfig.id}/v1/debts/${user}`,
  )

  if (userCollateral && userDebt) {
    return {
      id: user,
      debts: userDebt.map((debt) => new BNCoin(debt)),
      lends: userCollateral.map((lend) => new BNCoin(lend)),
      deposits: [],
      vaults: [],
      perps: [],
      kind: 'default',
    }
  }

  return new Promise((_, reject) => reject('No account found'))
}
