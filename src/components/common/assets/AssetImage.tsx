import { LogoUKNOWN } from 'components/common/assets/AssetLogos'
import Image from 'next/image'

interface Props {
  asset: Asset
  className?: string
}

export default function AssetImage(props: Props) {
  const AssetLogo = props.asset?.logo ?? null
  if (typeof AssetLogo === 'string')
    return (
      <div className={props.className}>
        <Image
          src={AssetLogo}
          width={24}
          height={24}
          alt={props.asset.symbol}
          className='w-full'
          loading='lazy'
        />
      </div>
    )
  return <div className={props.className}>{AssetLogo ? <AssetLogo /> : <LogoUKNOWN />}</div>
}
