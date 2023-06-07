export function resolvePositionResponses(responses: AccountResponse[]): Account[] {
  return responses.map(resolvePositionResponse)
}

export function resolvePositionResponse(response: AccountResponse): Account {
  return {
    id: response.account_id,
    deposits: response.deposits,
    debts: response.debts,
    lends: response.lends,
    vaults: response.vaults,
  }
}

export function resolveMarketResponses(responses: MarketResponse[]): Market[] {
  return responses.map((response) => ({
    denom: response.denom,
    borrowRate: Number(response.borrow_rate),
    debtTotalScaled: response.debt_total_scaled,
    collateralTotalScaled: response.collateral_total_scaled,
    depositEnabled: response.deposit_enabled,
    borrowEnabled: response.borrow_enabled,
    depositCap: response.deposit_cap,
    maxLtv: Number(response.max_loan_to_value),
  }))
}
