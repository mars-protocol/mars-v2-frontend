import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpPosition from 'hooks/perps/usePerpPosition'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePrice from 'hooks/usePrice'
import usePrices from 'hooks/usePrices'
import { SearchParams } from 'types/enums/searchParams'
import { getAccountNetValue } from 'utils/accounts'
import { demagnify } from 'utils/formatters'
import { getSearchParamsObject } from 'utils/route'

export default function usePerpsManageModule(amount: BigNumber | null) {
  const { perpsAsset } = usePerpsAsset()
  const [searchParams, setSearchParams] = useSearchParams()
  const perpPosition = usePerpPosition(perpsAsset.denom)
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const account = useCurrentAccount()
  const price = usePrice(perpsAsset.denom)

  const accountNetValue = useMemo(() => {
    if (!account || !prices || !assets) return BN_ZERO
    return getAccountNetValue(account, prices, assets)
  }, [account, assets, prices])

  const closeManagePerpModule = useCallback(() => {
    const params = getSearchParamsObject(searchParams)
    delete params[SearchParams.PERPS_MANAGE]
    setSearchParams({
      ...params,
    })
  }, [searchParams, setSearchParams])

  const previousAmount = useMemo(() => perpPosition?.amount ?? BN_ZERO, [perpPosition?.amount])
  const previousTradeDirection = useMemo(
    () => perpPosition?.tradeDirection || 'long',
    [perpPosition?.tradeDirection],
  )

  const previousLeverage = useMemo(
    () =>
      price.times(demagnify(previousAmount, perpsAsset)).div(accountNetValue).plus(1).toNumber(),
    [accountNetValue, perpsAsset, previousAmount, price],
  )

  const leverage = useMemo(
    () =>
      price
        .times(demagnify(amount ?? BN_ZERO, perpsAsset))
        .div(accountNetValue)
        .plus(1)
        .toNumber(),
    [accountNetValue, amount, perpsAsset, price],
  )

  return {
    closeManagePerpModule,
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    asset: perpsAsset,
  }
}
