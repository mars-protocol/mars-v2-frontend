import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { AssetParamsBaseForAddr as AssetParams } from 'types/generated/mars-params/MarsParams.types'

export function resolveMarketResponse(
  marketResponse: RedBankMarket,
  assetParamsResponse: AssetParams,
): Market {
  return {
    denom: marketResponse.denom,
    borrowRate: Number(marketResponse.borrow_rate),
    debtTotalScaled: marketResponse.debt_total_scaled,
    collateralTotalScaled: marketResponse.collateral_total_scaled,
    depositEnabled: assetParamsResponse.red_bank.deposit_enabled,
    borrowEnabled: assetParamsResponse.red_bank.borrow_enabled,
    depositCap: assetParamsResponse.deposit_cap,
    maxLtv: Number(assetParamsResponse.max_loan_to_value),
    liquidityRate: Number(marketResponse.liquidity_rate),
    liquidationThreshold: Number(assetParamsResponse.liquidation_threshold),
  }
}
