import { cacheFn, underlyingDebtCache } from 'api/cache'
import { getRedBankQueryClient } from 'api/cosmwasm-client'
import getMarkets from 'api/markets/getMarkets'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getMarketDebts(): Promise<BNCoin[]> {
  try {
    const markets: Market[] = await getMarkets()
    const redBankQueryClient = await getRedBankQueryClient()

    const debtQueries = markets.map((asset) =>
      cacheFn(
        () =>
          redBankQueryClient.underlyingDebtAmount({
            denom: asset.denom,
            amountScaled: asset.debtTotalScaled,
          }),
        underlyingDebtCache,
        `denoms/${asset.denom}/amount/${asset.debtTotalScaled}`,
        60,
      ),
    )
    const debtsResults = await Promise.all(debtQueries)

    return debtsResults.map<BNCoin>(
      (debt, index) => new BNCoin({ denom: markets[index].denom, amount: debt }),
    )
  } catch (ex) {
    throw ex
  }
}
