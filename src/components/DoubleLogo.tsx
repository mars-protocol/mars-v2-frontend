import AssetImage from 'components/Asset/AssetImage'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  primaryDenom: string
  secondaryDenom: string
}

export default function DoubleLogo(props: Props) {
  const primaryAsset = getAssetByDenom(props.primaryDenom)
  const secondaryAsset = getAssetByDenom(props.secondaryDenom)

  if (!primaryAsset || !secondaryAsset) return null

  return (
    <div className='relative grid w-12 place-items-center'>
      <div className='absolute'>
        <AssetImage asset={primaryAsset} size={24} />
      </div>
      <div className='absolute'>
        <AssetImage asset={secondaryAsset} size={16} className='ml-5 mt-5' />
      </div>
    </div>
  )
}
