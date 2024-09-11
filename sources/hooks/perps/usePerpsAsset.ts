import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getDefaultChainSettings } from '../../constants/defaultSettings'
import { LocalStorageKeys } from '../../constants/localStorageKeys'
import { SearchParams } from '../../types/enums'
import { getSearchParamsObject } from '../../utils/route'
import usePerpsEnabledAssets from '../assets/usePerpsEnabledAssets'
import useChainConfig from '../chain/useChainConfig'
import useLocalStorage from '../localStorage/useLocalStorage'

export default function usePerpsAsset() {
  const chainConfig = useChainConfig()
  const [searchParams, setSearchParams] = useSearchParams()
  const perpsAssets = usePerpsEnabledAssets()
  const perpsAssetInParams = searchParams.get('perpsMarket')
  const [perpsAssetInLocalStorage, setPerpsAssetInLocalStorage] = useLocalStorage<
    Settings['perpsAsset']
  >(
    chainConfig.id + '/' + LocalStorageKeys.PERPS_ASSET,
    getDefaultChainSettings(chainConfig).perpsAsset,
  )

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
