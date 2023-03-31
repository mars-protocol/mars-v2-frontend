export function resolvePositionResponses(responses: PositionResponse[]): Position[] {
  return responses.map(resolvePositionResponse)
}

export function resolvePositionResponse(response: PositionResponse): Position {
  return {
    account: response.account_id,
    deposits: response.deposits,
    debts: response.debts,
    lends: response.lends,
  }
}

export function resolveMarketResponses(responses: MarketResponse[]): Market[] {
  return responses.map((response) => ({
    denom: response.denom,
    borrowRate: Number(response.borrow_rate),
    debtTotalScaled: Number(response.debt_total_scaled),
    collateralTotalScaled: Number(response.collateral_total_scaled),
    depositEnabled: response.deposit_enabled,
    borrowEnabled: response.borrow_enabled,
    depositCap: Number(response.deposit_cap),
  }))
}
