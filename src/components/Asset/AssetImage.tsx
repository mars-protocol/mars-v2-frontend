import Image from 'next/image'

interface Props {
  asset: Asset
  size: number
  className?: string
}

export default function AssetImage(props: Props) {
  if (!props.asset.logo)
    return (
      <div
        className={props.className}
        style={{ width: `${props.size}px`, height: `${props.size}px` }}
      />
    )

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
