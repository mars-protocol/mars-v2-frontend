import AssetImage from 'components/Asset/AssetImage'
import Button from 'components/Button'

interface Props {
  asset: Asset
  onClick: () => void
}

export default function AssetButton(props: Props) {
  return (
    <Button
      leftIcon={<AssetImage asset={props.asset} size={16} />}
      text={props.asset.symbol}
      color='tertiary'
      variant='transparent'
      className='w-full border border-white/20'
      textClassNames='flex flex-1'
      size='md'
      hasSubmenu
      {...props}
    />
  )
}
