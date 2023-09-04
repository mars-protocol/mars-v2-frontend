import { getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getUnderlyingLiquidityAmount(market: Market): Promise<string> {
  try {
    const client = await getRedBankQueryClient()
    return await client.underlyingLiquidityAmount({
      denom: market.denom,
      amountScaled: market.collateralTotalScaled,
    })
  } catch (ex) {
    throw ex
  }
}
