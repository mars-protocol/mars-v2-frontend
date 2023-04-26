import Image from 'next/image'

import { getAssetByDenom } from 'utils/assets'

interface Props {
  vault: Vault
}

export default function VaultLogo(props: Props) {
  const primaryAsset = getAssetByDenom(props.vault.denoms.primary)
  const secondaryAsset = getAssetByDenom(props.vault.denoms.secondary)

  if (!primaryAsset || !secondaryAsset) return null

  return (
    <div className='relative grid w-12 place-items-center'>
      <div className='absolute'>
        <Image src={primaryAsset.logo} alt={`${primaryAsset.symbol} logo`} width={24} height={24} />
      </div>
      <div className='absolute'>
        <Image className='ml-5 mt-5' src={secondaryAsset.logo} alt='token' width={16} height={16} />
      </div>
    </div>
  )
}
