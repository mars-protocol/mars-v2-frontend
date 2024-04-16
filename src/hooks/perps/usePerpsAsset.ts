import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { SearchParams } from 'types/enums'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { getSearchParamsObject } from 'utils/route'

export default function usePerpsAsset() {
  const chainConfig = useChainConfig()
  const [searchParams, setSearchParams] = useSearchParams()
  const perpsAssets = usePerpsEnabledAssets()
  const perpsAssetInParams = searchParams.get('perpsMarket')
  const [perpsAssetInLocalStorage, setPerpsAssetInLocalStorage] = useLocalStorage<
    Settings['perpsAsset']
  >(chainConfig.id + '/' + LocalStorageKeys.PERPS_ASSET, DEFAULT_SETTINGS.perpsAsset)

  const updatePerpsAsset = useCallback(
    (denom: string, manage?: boolean) => {
      const params = getSearchParamsObject(searchParams)
      setSearchParams({
        ...params,
        [SearchParams.PERPS_MARKET]: denom,
      })
      setPerpsAssetInLocalStorage(denom)
    },
    [searchParams, setPerpsAssetInLocalStorage, setSearchParams],
  )

  return {
    perpsAsset: useMemo(
      () =>
        perpsAssets.find(
          (asset) => asset.denom === (perpsAssetInParams || perpsAssetInLocalStorage),
        ) ?? perpsAssets[0],
      [perpsAssetInLocalStorage, perpsAssetInParams, perpsAssets],
    ),
    updatePerpsAsset,
  }
}
