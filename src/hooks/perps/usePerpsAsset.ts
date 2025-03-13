import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { SearchParams } from 'types/enums'
import { getSearchParamsObject } from 'utils/route'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useAllPerpsParamsSC } from 'hooks/perps/usePerpsParams'

export default function usePerpsAsset() {
  const chainConfig = useChainConfig()
  const [searchParams, setSearchParams] = useSearchParams()
  const perpsAssets = usePerpsEnabledAssets()
  const perpsAssetInParams = searchParams.get('perpsMarket')
  const currentAccount = useCurrentAccount()
  const { data: perpsParams } = useAllPerpsParamsSC()
  const [perpsAssetInLocalStorage, setPerpsAssetInLocalStorage] = useLocalStorage<
    Settings['perpsAsset']
  >(
    chainConfig.id + '/' + LocalStorageKeys.PERPS_ASSET,
    getDefaultChainSettings(chainConfig).perpsAsset,
  )

  // Filter assets based on USDC account type and liquidation threshold
  const filteredPerpAssets = useMemo(() => {
    if (currentAccount?.kind === 'usdc')
      return perpsAssets.filter((asset) => {
        const assetParams = perpsParams?.find((param) => param.denom === asset.denom)
        return assetParams?.liquidation_threshold_usdc?.is_enabled === true
      })
    return perpsAssets.filter((asset) => {
      const assetParams = perpsParams?.find((param) => param.denom === asset.denom)
      return assetParams?.liquidation_threshold.is_enabled === true
    })
  }, [currentAccount?.kind, perpsAssets, perpsParams])

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
        filteredPerpAssets.find(
          (asset) => asset.denom === (perpsAssetInParams || perpsAssetInLocalStorage),
        ) ?? filteredPerpAssets[0],
      [filteredPerpAssets, perpsAssetInLocalStorage, perpsAssetInParams],
    ),
    updatePerpsAsset,
  }
}
