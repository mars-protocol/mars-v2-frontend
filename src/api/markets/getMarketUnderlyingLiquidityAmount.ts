import { getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getUnderlyingLiquidityAmount(market: Market): Promise<string> {
  try {
    const client = await getRedBankQueryClient()
    const marketLiquidityAmount: string = await client.underlyingLiquidityAmount({
      denom: market.denom,
      amountScaled: market.collateralTotalScaled,
    })

    return marketLiquidityAmount
  } catch (ex) {
    throw ex
  }
}
