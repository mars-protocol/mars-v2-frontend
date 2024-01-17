import { useCallback } from 'react'

import Button from 'components/common/Button'
import { ChevronDown } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetOverlay from 'components/trade/TradeModule/AssetSelector/AssetOverlay'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import useStore from 'store'

interface Props {
  asset: Asset
}

export default function AssetSelectorPerps(props: Props) {
  const assetOverlayState = useStore((s) => s.assetOverlayState)
  const { perpsAsset, updatePerpsAsset } = usePerpsAsset()

  const perpAssets = usePerpsEnabledAssets()

  const onChangePerpsAsset = useCallback(
    (asset: Asset) => {
      updatePerpsAsset(asset.denom)
    },
    [updatePerpsAsset],
  )

  const handleChangeState = useCallback(() => {
    useStore.setState({ assetOverlayState: 'closed' })
  }, [])

  return (
    <>
      <Button
        color='quaternary'
        variant='transparent'
        onClick={() => useStore.setState({ assetOverlayState: 'pair' })}
        className='flex items-center justify-between w-full py-5 bg-white/5'
      >
        <Text size='sm' className='text-white/60'>
          <span className='text-white'>{perpsAsset.symbol}</span>/USD
        </Text>
        <div className='flex items-center gap-2'>
          <Text>All markets</Text>
          <ChevronDown className='w-3 h-3' />
        </div>
      </Button>
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
