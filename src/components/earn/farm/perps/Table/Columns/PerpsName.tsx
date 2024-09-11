import useAsset from '../../../../../../hooks/assets/useAsset'
import AssetImage from '../../../../../common/assets/AssetImage'
import TitleAndSubCell from '../../../../../common/TitleAndSubCell'

interface Props {
  vault: PerpsVault
}

export function PerpsName(props: Props) {
  const asset = useAsset(props.vault.denom)

  if (!asset) return null

  return (
    <div className='flex items-center flex-1 gap-3'>
      <AssetImage asset={asset} className='w-8 h-8' />
      <TitleAndSubCell
        title={`${props.vault.name} - (${props.vault.lockup.duration}${props.vault.lockup.timeframe[0]})`}
        sub={`Via ${props.vault.provider}`}
        className='text-left min-w-15'
      />
    </div>
  )
}
