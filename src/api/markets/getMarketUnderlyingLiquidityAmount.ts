import { cacheFn, underlyingLiquidityAmountCache } from 'api/cache'
import { getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getUnderlyingLiquidityAmount(
  chainConfig: ChainConfig,
  market: Market,
): Promise<string> {
  return cacheFn(
    () => fetchUnderlyingLiquidityAmount(chainConfig, market),
    underlyingLiquidityAmountCache,
    `underlyingLiquidity/${market.denom}/amount/${market.collateralTotalScaled}`,
    60,
  )
}

async function fetchUnderlyingLiquidityAmount(chainConfig: ChainConfig, market: Market) {
  try {
    const client = await getRedBankQueryClient(chainConfig.endpoints.rpc)
    return await client.underlyingLiquidityAmount({
      denom: market.denom,
      amountScaled: market.collateralTotalScaled,
    })
  } catch (ex) {
    throw ex
  }
}
