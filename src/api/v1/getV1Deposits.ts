import { getRedBankQueryClient } from 'api/cosmwasm-client'
import { ArrayOfUserCollateralResponse } from 'types/generated/mars-red-bank/MarsRedBank.types'

export default async function getV1Deposits(
  chainConfig: ChainConfig,
  user: string,
): Promise<ArrayOfUserCollateralResponse> {
  const redBankQueryClient = await getRedBankQueryClient(chainConfig)

  const userCollateral: ArrayOfUserCollateralResponse = await redBankQueryClient.userCollaterals({
    user: user,
    limit: 50,
  })

  if (userCollateral) {
    return userCollateral
  }

  return new Promise((_, reject) => reject('No account found'))
}
