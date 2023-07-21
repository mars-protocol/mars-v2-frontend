import { BNCoin } from 'types/classes/BNCoin'
import { Positions as CreditManagerPosition } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { Market as RedBankMarket } from 'types/generated/mars-mock-red-bank/MarsMockRedBank.types'

export function resolvePositionResponses(responses: CreditManagerPosition[]): Account[] {
  return responses.map(resolvePositionResponse)
}

export function resolvePositionResponse(response: CreditManagerPosition): Account {
  return {
    id: response.account_id,
    debts: response.debts?.map((debt) => new BNCoin(debt)),
    lends: response.lends?.map((lend) => new BNCoin(lend)),
    deposits: response.deposits?.map((deposit) => new BNCoin(deposit)),
    vaults: response.vaults,
  }
}

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
