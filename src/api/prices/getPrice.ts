import { getOracleQueryClient } from 'api/cosmwasm-client'
import { PriceResponse } from 'types/generated/mars-mock-oracle/MarsMockOracle.types'

export default async function getPrice(denom: string): Promise<PriceResponse> {
  try {
    const oracleQueryClient = getOracleQueryClient()

    return (await oracleQueryClient).price({ denom })
  } catch (ex) {
    throw ex
  }
}
