import { cacheFn, underlyingLiquidityAmountCache } from 'api/cache'
import { getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getUnderlyingLiquidityAmount(market: Market): Promise<string> {
  return cacheFn(
    () => fetchUnderlyingLiquidityAmount(market),
    underlyingLiquidityAmountCache,
    `underlyingLiquidity/${market.denom}/amount/${market.collateralTotalScaled}`,
    60,
  )
}

async function fetchUnderlyingLiquidityAmount(market: Market) {
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
