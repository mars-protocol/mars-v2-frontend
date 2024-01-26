import useSWR from 'swr'

import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'
import useMarketsInfo from 'hooks/markets/useMarketsInfo'
import useAssetParams from 'hooks/params/useAssetParams'
import useAssets from 'hooks/useAssets'
import useChainConfig from 'hooks/useChainConfig'
import {
  AssetParamsBaseForAddr as AssetParams,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { byDenom } from 'utils/array'
import { resolveMarketResponse } from 'utils/resolvers'

export default function useMarkets() {
  const chainConfig = useChainConfig()
  const { data: marketInfos } = useMarketsInfo()
  const { data: marketDepositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()
  const assets = useAssets()

  return useSWR(
    !!marketInfos?.length &&
      !!marketDepositCaps?.length &&
      !!assetParams.length &&
      `chains/${chainConfig.id}/markets`,
    () => {
      return assets.map((asset) =>
        resolveMarketResponse(
          asset,
          marketInfos!.find(byDenom(asset.denom)) as RedBankMarket & Partial<Market>,
          assetParams.find(byDenom(asset.denom)) as AssetParams,
          marketDepositCaps!.find(byDenom(asset.denom)) as TotalDepositResponse,
        ),
      )
    },
    {
      fallbackData: [],
    },
  ).data
}
