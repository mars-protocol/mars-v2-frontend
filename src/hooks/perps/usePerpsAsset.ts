import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/useChainConfig'

export default function usePerpsAsset() {
  const chainConfig = useChainConfig()
  const [searchParams] = useSearchParams()
  const perpsAssets = usePerpsEnabledAssets()
  const perpsAssetInParams = searchParams.get('perpsMarket')
  const [perpsAssetInLocalStorage, setPerpsAssetInLocalStorage] = useLocalStorage<
    Settings['perpsAsset']
  >(chainConfig.id + '/' + LocalStorageKeys.PERPS_ASSET, DEFAULT_SETTINGS.perpsAsset)

  const updatePerpsAsset = useCallback(
    (denom: string) => {
      setPerpsAssetInLocalStorage(denom)
    },
    [setPerpsAssetInLocalStorage],
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
