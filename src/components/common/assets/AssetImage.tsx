import Image from 'next/image'

interface Props {
  asset?: Asset
  className?: string
}

export function LogoUknown() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='0 0 183 183'>
      <circle fill='#ffffff' cx='91.5' cy='91.5' r='91.5' />
      <polygon
        fill='#ff6661'
        points='126 107.9 142.4 91.5 126 75.1 126 57 107.9 57 91.5 40.6 75.1 57 57 57 57 75.1 40.6 91.5 57 107.9 57 126 75.1 126 91.5 142.4 107.9 126 126 126 126 107.9'
      />
    </svg>
  )
}

export default function AssetImage(props: Props) {
  if (props.asset?.logo)
    return (
      <div className={props.className}>
        <Image
          src={props.asset.logo}
          width={24}
          height={24}
          alt={props.asset.symbol}
          className='w-full h-full'
          loading='lazy'
        />
      </div>
    )

  return (
    <div className={props.className}>
      <LogoUknown />
    </div>
  )
}
