import AssetImage from 'components/common/assets/AssetImage'
import Text from 'components/common/Text'
import usePerpsVault from 'hooks/perps/usePerpsVault'

interface Props {
  asset: Asset
}
export function Header(props: Props) {
  const { data: perpsVault } = usePerpsVault()

  if (!perpsVault) return null

  return (
    <div className='flex items-center gap-4 px-4'>
      <AssetImage asset={props.asset} className='w-6 h-6' />
      <Text>{perpsVault.name}</Text>
    </div>
  )
}
