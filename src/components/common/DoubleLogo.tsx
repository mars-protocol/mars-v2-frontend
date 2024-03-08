import AssetImage from 'components/common/assets/AssetImage'
import useAsset from 'hooks/assets/useAsset'

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
        <AssetImage asset={primaryAsset} size={24} />
      </div>
      <div className='absolute'>
        <AssetImage asset={secondaryAsset} size={16} className='mt-5 ml-5' />
      </div>
    </div>
  )
}
