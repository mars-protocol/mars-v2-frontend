import { SwapIcon } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import AssetButton from './AssetButton'

export default function AssetSelector() {
  return (
    <div className='grid-rows-auto grid grid-cols-[auto_min-content_auto] gap-y-2 bg-white/5 p-3'>
      <Text size='sm'>Buy</Text>
      <Text size='sm' className='col-start-3'>
        Sell
      </Text>
      <AssetButton asset={ASSETS[0]} />
      <SwapIcon className='mx-2 w-4 place-self-center' />
      <AssetButton asset={ASSETS[1]} />
    </div>
  )
}
