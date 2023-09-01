import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import {
  AssetParamsBaseForAddr as AssetParams,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'

import { BN } from './helpers'

export function resolveMarketResponse(
  marketResponse: RedBankMarket,
  assetParamsResponse: AssetParams,
  assetCapResponse: TotalDepositResponse,
): Market {
  return {
    denom: marketResponse.denom,
    borrowRate: Number(marketResponse.borrow_rate),
    debtTotalScaled: marketResponse.debt_total_scaled,
    collateralTotalScaled: marketResponse.collateral_total_scaled,
    depositEnabled: assetParamsResponse.red_bank.deposit_enabled,
    borrowEnabled: assetParamsResponse.red_bank.borrow_enabled,
    cap: {
      denom: assetCapResponse.denom,
      used: BN(assetCapResponse.amount),
      max: BN(assetParamsResponse.deposit_cap),
    },
    maxLtv: Number(assetParamsResponse.max_loan_to_value),
    liquidityRate: Number(marketResponse.liquidity_rate),
    liquidationThreshold: Number(assetParamsResponse.liquidation_threshold),
  }
}
