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
    <div className='flex gap-4 items-center px-4'>
      <AssetImage asset={props.asset} size={24} />
      <Text>{perpsVault.name}</Text>
    </div>
  )
}
