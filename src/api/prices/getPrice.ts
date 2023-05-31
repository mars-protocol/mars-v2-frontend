import { getClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'

export default async function getPrice(denom: string): Promise<PriceResult> {
  try {
    const client = await getClient()

    return await client.queryContractSmart(ENV.ADDRESS_ORACLE, {
      price: {
        denom,
      },
    })
  } catch (ex) {
    throw ex
  }
}
