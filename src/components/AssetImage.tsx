import Image from 'next/image'

interface Props {
  asset: Asset
  size: number
  className?: string
}

export default function AssetImage(props: Props) {
  return (
    <Image
      src={props.asset.logo}
      alt={`${props.asset.symbol} logo`}
      width={props.size}
      height={props.size}
      className={props.className}
    />
  )
}
