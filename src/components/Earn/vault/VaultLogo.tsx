import Image from 'next/image'

import AssetImage from 'components/AssetImage'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  vault: VaultMetaData
}

export default function VaultLogo(props: Props) {
  const primaryAsset = getAssetByDenom(props.vault.denoms.primary)
  const secondaryAsset = getAssetByDenom(props.vault.denoms.secondary)

  if (!primaryAsset || !secondaryAsset) return null

  return (
    <div className='relative grid w-12 place-items-center'>
      <div className='absolute'>
        <AssetImage asset={primaryAsset} size={24} />
      </div>
      <div className='absolute'>
        <AssetImage asset={primaryAsset} size={16} className='ml-5 mt-5' />
      </div>
    </div>
  )
}
