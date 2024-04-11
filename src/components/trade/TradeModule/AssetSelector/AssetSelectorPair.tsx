import { useCallback } from 'react'

import Button from 'components/common/Button'
import { ChevronDown } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetOverlay from 'components/trade/TradeModule/AssetSelector/AssetOverlay'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  assets: Asset[]
}

export default function AssetSelectorPair(props: Props) {
  const chainConfig = useChainConfig()
  const [_, setTradingPairSimple] = useLocalStorage<Settings['tradingPairSimple']>(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_SIMPLE,
    DEFAULT_SETTINGS.tradingPairSimple,
  )
  const { buyAsset, sellAsset } = props
  const assetOverlayState = useStore((s) => s.assetOverlayState)
  const onChangeTradingPair = useCallback(
    (tradingPair: TradingPair) => {
      setTradingPairSimple(tradingPair)
    },
    [setTradingPairSimple],
  )

  const handleChangeState = useCallback((state: OverlayState) => {
    useStore.setState({ assetOverlayState: state })
  }, [])

  return (
    <>
      <Button
        color='quaternary'
        variant='transparent'
        onClick={() => useStore.setState({ assetOverlayState: 'pair' })}
        className='flex items-center justify-between w-full py-5 bg-white/10'
      >
        <Text size='sm' className='text-white/60'>
          <span className='text-white'>{buyAsset.symbol}</span>/{sellAsset.symbol}
        </Text>
        <div className='flex items-center gap-2'>
          <Text>All markets</Text>
          <ChevronDown className='w-3 h-3' />
        </div>
      </Button>
      <AssetOverlay
        state={assetOverlayState}
        onChangeState={handleChangeState}
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        onChangeTradingPair={onChangeTradingPair}
        buyAssets={props.assets}
        type='pair'
      />
    </>
  )
}
