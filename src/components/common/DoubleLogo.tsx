import useAsset from 'hooks/assets/useAsset'
import AssetImage from './assets/AssetImage'

interface Props {
  primaryDenom: string
  secondaryDenom: string
}

export default function DoubleLogo(props: Props) {
  const primaryAsset = useAsset(props.primaryDenom)
  const secondaryAsset = useAsset(props.secondaryDenom)

  if (!primaryAsset || !secondaryAsset) return null

  return (
    <div className='relative grid w-9 h-9 place-items-center'>
      <div className='absolute'>
        <AssetImage asset={primaryAsset} className='w-5 h-5 -mt-3 -ml-3' />
      </div>
      <div className='absolute'>
        <AssetImage asset={secondaryAsset} className='w-5 h-5 mt-2 ml-2' />
      </div>
    </div>
  )
}
