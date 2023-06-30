import { useCallback } from 'react'

import { SwapIcon } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import useToggle from 'hooks/useToggle'
import AssetButton from 'components/Trade/TradeModule/AssetSelector/AssetButton'
import AssetOverlay from 'components/Trade/TradeModule/AssetSelector/AssetOverlay'

export default function AssetSelector() {
  const [show, toggleShow] = useToggle()

  const handleToggleShow = useCallback(() => toggleShow(), [toggleShow])

  return (
    <div className='grid-rows-auto relative grid grid-cols-[auto_min-content_auto] gap-y-2 bg-white/5 p-3'>
      <Text size='sm'>Buy</Text>
      <Text size='sm' className='col-start-3'>
        Sell
      </Text>
      <AssetButton onClick={handleToggleShow} asset={ASSETS[0]} />
      <SwapIcon className='mx-2 w-4 place-self-center' />
      <AssetButton onClick={handleToggleShow} asset={ASSETS[1]} />
      <AssetOverlay show={show} toggleShow={handleToggleShow} />
    </div>
  )
}
