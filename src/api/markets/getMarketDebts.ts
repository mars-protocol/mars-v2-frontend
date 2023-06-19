import getMarkets from 'api/markets/getMarkets'
import { getRedBankQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getMarketDebts(): Promise<BNCoin[]> {
  try {
    const markets: Market[] = await getMarkets()
    const redBankQueryClient = await getRedBankQueryClient()

    const debtQueries = markets.map((asset) =>
      redBankQueryClient.underlyingDebtAmount({
        denom: asset.denom,
        amountScaled: asset.debtTotalScaled,
      }),
    )
    const debtsResults = await Promise.all(debtQueries)

    return debtsResults.map<BNCoin>(
      (debt, index) => new BNCoin({ denom: markets[index].denom, amount: debt }),
    )
  } catch (ex) {
    throw ex
  }
}
