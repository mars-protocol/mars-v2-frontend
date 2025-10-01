import { useCallback } from 'react'

import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import { ChevronDown } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetOverlay from 'components/trade/TradeModule/AssetSelector/AssetOverlay'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import useStore from 'store'

interface Props {
  asset: Asset
  hasActivePosition: boolean
  onAssetSelect: (newAsset: Asset) => void
}

export default function AssetSelectorPerps(props: Props) {
  const assetOverlayState = useStore((s) => s.assetOverlayState)
  const { perpsAsset, updatePerpsAsset } = usePerpsAsset()
  const currentAccount = useCurrentAccount()

  const perpAssets = usePerpsEnabledAssets()

  const onChangePerpsAsset = useCallback(
    (asset: Asset) => {
      let hasPosition = false
      if (
        currentAccount &&
        currentAccount.perps &&
        currentAccount.perps.find((perp) => perp.denom === asset.denom)
      ) {
        hasPosition = true
      }
      updatePerpsAsset(asset.denom, hasPosition)
      props.onAssetSelect(asset)
    },
    [currentAccount, props, updatePerpsAsset],
  )

  const handleChangeState = useCallback(() => {
    useStore.setState({ assetOverlayState: 'closed' })
  }, [])
  return (
    <>
      <div className='w-full bg-surface-dark'>
        <Button
          color='quaternary'
          variant='transparent'
          onClick={() => useStore.setState({ assetOverlayState: 'pair' })}
          className='flex items-center justify-between w-full py-4 h-14'
        >
          <div className='flex items-center gap-2'>
            <AssetImage asset={perpsAsset} className='w-5 h-5' />
            <Text size='sm' className='text-white/60'>
              <span className='text-white'>{perpsAsset.symbol}</span>/USD
            </Text>

            {props.hasActivePosition && (
              <div className='px-1.5 py-0.5 bg-white/10 rounded-sm text-white text-xs'>Active</div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Text>All markets</Text>
            <ChevronDown className='w-3 h-3' />
          </div>
        </Button>
      </div>
      <AssetOverlay
        buyAssets={perpAssets}
        state={assetOverlayState}
        onChangeState={handleChangeState}
        buyAsset={props.asset}
        sellAsset={props.asset}
        onChangeBuyAsset={onChangePerpsAsset}
        type='perps'
      />
    </>
  )
}
