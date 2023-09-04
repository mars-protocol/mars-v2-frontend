import { getEnabledMarketAssets } from 'utils/assets'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'
import iterateContractQuery from 'utils/iterateContractQuery'
import { byDenom } from 'utils/array'
import { resolveMarketResponse } from 'utils/resolvers'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import {
  AssetParamsBaseForAddr as AssetParams,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const redBankClient = await getRedBankQueryClient()
    const paramsClient = await getParamsQueryClient()

    const enabledAssets = getEnabledMarketAssets()
    const capQueries = enabledAssets.map((asset) =>
      paramsClient.totalDeposit({ denom: asset.denom }),
    )
    const [markets, assetParams, assetCaps] = await Promise.all([
      iterateContractQuery(redBankClient.markets),
      iterateContractQuery(paramsClient.allAssetParams),
      Promise.all(capQueries),
    ])

    return enabledAssets.map((asset) =>
      resolveMarketResponse(
        markets.find(byDenom(asset.denom)) as RedBankMarket,
        assetParams.find(byDenom(asset.denom)) as AssetParams,
        assetCaps.find(byDenom(asset.denom)) as TotalDepositResponse,
      ),
    )
  } catch (ex) {
    throw ex
  }
}
