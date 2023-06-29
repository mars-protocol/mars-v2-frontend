import AssetImage from 'components/AssetImage'
import Button from 'components/Button'

interface Props {
  asset: Asset
}

export default function AssetButton(props: Props) {
  return (
    <Button
      leftIcon={<AssetImage asset={props.asset} size={16} />}
      text={props.asset.symbol}
      color='tertiary'
      variant='transparent'
      className='w-full border border-white/20'
      size='medium'
      hasSubmenu
    />
  )
}
