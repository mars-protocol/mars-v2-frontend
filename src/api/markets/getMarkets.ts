import { getEnabledMarketAssets } from 'utils/assets'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'
import iterateContractQuery from 'utils/iterateContractQuery'
import { byDenom } from 'utils/array'
import { resolveMarketResponse } from 'utils/resolvers'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { AssetParamsBaseForAddr as AssetParams } from 'types/generated/mars-params/MarsParams.types'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const redbankClient = await getRedBankQueryClient()
    const paramsClient = await getParamsQueryClient()

    const enabledAssets = getEnabledMarketAssets()
    const [markets, assetParams] = await Promise.all([
      iterateContractQuery(redbankClient.markets),
      iterateContractQuery(paramsClient.allAssetParams),
    ])

    return enabledAssets.map((asset) =>
      resolveMarketResponse(
        markets.find(byDenom(asset.denom)) as RedBankMarket,
        assetParams.find(byDenom(asset.denom)) as AssetParams,
      ),
    )
  } catch (ex) {
    throw ex
  }
}
