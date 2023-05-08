import classNames from 'classnames'
import Image from 'next/image'

import DisplayCurrency from 'components/DisplayCurrency'
import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { formatValue } from 'utils/formatters'

interface Props extends Option {
  isSelected?: boolean
  isDisplay?: boolean
  isClicked?: boolean
  onClick?: (value: string) => void
}

export default function Option(props: Props) {
  const isCoin = !!props.denom

  if (isCoin) {
    const currentAsset = ASSETS.find((asset) => asset.denom === props.denom)
    const symbol = currentAsset?.symbol ?? ASSETS[0].symbol
    const logo = currentAsset?.logo ?? ASSETS[0].logo
    const denom = currentAsset?.denom ?? ASSETS[0].denom
    const decimals = currentAsset?.decimals ?? ASSETS[0].decimals
    const balance = props.amount ?? '0'

    if (props.isDisplay) {
      return (
        <div
          className={classNames('flex items-center gap-2 bg-white/10 p-3', 'hover:cursor-pointer')}
        >
          <Image src={logo} alt={`${symbol} token logo`} width={20} height={20} />
          <span>{symbol}</span>
          <span
            className={classNames(
              'inline-block w-2.5 transition-transform',
              props.isClicked ? 'rotate-0' : '-rotate-90',
            )}
          >
            <ChevronDown />
          </span>
        </div>
      )
    }

    return (
      <div
        className={classNames(
          'grid grid-flow-row grid-cols-5 grid-rows-2 py-3.5 pr-4',
          'border-b border-b-white/20 last:border-none',
          'hover:cursor-pointer hover:bg-white/20',
          !props.isSelected ? 'bg-white/10' : 'pointer-events-none',
        )}
        onClick={() => props?.onClick && props.onClick(denom)}
      >
        <div className='row-span-2 flex h-full items-center justify-center'>
          <Image src={logo} alt={`${symbol} token logo`} width={32} height={32} />
        </div>
        <Text className='col-span-2 pb-1'>{symbol}</Text>
        <Text size='sm' className='col-span-2 pb-1 text-right font-bold'>
          {formatValue(balance, { decimals, maxDecimals: 4, minDecimals: 0, rounded: true })}
        </Text>
        <Text size='sm' className='col-span-2 text-white/50'>
          {formatValue(5, { maxDecimals: 2, minDecimals: 0, prefix: 'APY ', suffix: '%' })}
        </Text>
        <Text size='sm' className='col-span-2 text-right text-white/50'>
          <DisplayCurrency coin={{ denom, amount: balance }} />
        </Text>
      </div>
    )
  }

  const label = props.label
  if (props.isDisplay) {
    return <div className={classNames('block bg-white/10 p-3 hover:cursor-pointer')}>{label}</div>
  }

  return (
    <div
      className={classNames(
        'block  p-3 hover:cursor-pointer hover:bg-white/20',
        props.isSelected && 'bg-white/10',
      )}
      onClick={() => props?.onClick && props.onClick(props.value)}
    >
      {label}
    </div>
  )
}
