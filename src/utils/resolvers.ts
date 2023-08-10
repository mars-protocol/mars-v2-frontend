import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'

export function resolveMarketResponses(responses: RedBankMarket[]): Market[] {
  return responses.map(resolveMarketResponse)
}

export function resolveMarketResponse(response: RedBankMarket): Market {
  return {
    denom: response.denom,
    borrowRate: Number(response.borrow_rate),
    debtTotalScaled: response.debt_total_scaled,
    collateralTotalScaled: response.collateral_total_scaled,
    depositEnabled: response.deposit_enabled,
    borrowEnabled: response.borrow_enabled,
    depositCap: response.deposit_cap,
    maxLtv: Number(response.max_loan_to_value),
    liquidityRate: Number(response.liquidity_rate),
    liquidationThreshold: Number(response.liquidation_threshold),
  }
}
