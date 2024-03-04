import { getRedBankQueryClient } from 'api/cosmwasm-client'
import { ArrayOfUserDebtResponse } from 'types/generated/mars-red-bank/MarsRedBank.types'

export default async function getV1Positions(
  chainConfig: ChainConfig,
  user: string,
): Promise<ArrayOfUserDebtResponse> {
  const redBankQueryClient = await getRedBankQueryClient(chainConfig)

  const userDebt: ArrayOfUserDebtResponse = await redBankQueryClient.userDebts({
    user: user,
    limit: 50,
  })

  if (userDebt) {
    return userDebt
  }

  return new Promise((_, reject) => reject('No account found'))
}
