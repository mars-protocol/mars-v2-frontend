import Image from 'next/image'
import classNames from 'classnames'

interface Props {
  asset: Asset
  className?: string
  evmChainLogo: string | null
  size?: number
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

export default function AssetImageEvm(props: Props) {
  const mainImageSize = props.size ?? 24
  const evmLogoSize = Math.floor(mainImageSize / 2)

  if (props.asset.logo)
    return (
      <div className={classNames('relative', props.className)}>
        <Image
          src={props.asset.logo}
          width={mainImageSize}
          height={mainImageSize}
          alt={props.asset.symbol}
          className='w-full h-full'
          loading='lazy'
        />
        <div
          className='absolute'
          style={{
            bottom: `-${evmLogoSize / 4}px`,
            right: `-${evmLogoSize / 4}px`,
          }}
        >
          <div className='rounded-full' style={{ border: '1px solid #1D1122' }}>
            {props.asset.chainName && props.evmChainLogo && (
              <Image
                src={props.evmChainLogo}
                width={evmLogoSize}
                height={evmLogoSize}
                alt='EVM Chain'
                className='rounded-full'
              />
            )}
          </div>
        </div>
      </div>
    )

  return (
    <div className={classNames('relative', props.className)}>
      <LogoUknown />
      <div
        className='absolute'
        style={{
          bottom: `-${evmLogoSize / 4}px`,
          right: `-${evmLogoSize / 4}px`,
        }}
      >
        <div className='rounded-full' style={{ border: '1px solid #1D1122' }}>
          {props.asset.chainName && props.evmChainLogo && (
            <Image
              src={props.evmChainLogo}
              width={evmLogoSize}
              height={evmLogoSize}
              alt='EVM Chain'
              className='rounded-full'
            />
          )}
        </div>
      </div>
    </div>
  )
}
