import AssetImage from 'components/common/assets/AssetImage'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useAsset from 'hooks/assets/useAsset'

interface Props {
  vault: PerpsVault
}

export function PerpsName(props: Props) {
  const asset = useAsset(props.vault.denom)

  if (!asset) return null

  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} size={32} />
      <TitleAndSubCell
        title={props.vault.name}
        sub={`Via ${props.vault.provider}`}
        className='text-left min-w-15'
      />
    </div>
  )
}
