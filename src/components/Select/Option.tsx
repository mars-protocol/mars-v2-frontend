import classNames from 'classnames'
import Image from 'next/image'

import DisplayCurrency from 'components/DisplayCurrency'
import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { formatValue } from 'utils/formatters'
import AssetImage from 'components/AssetImage'

interface Props extends Option {
  isSelected?: boolean
  isDisplay?: boolean
  isClicked?: boolean
  onClick?: (value: string) => void
}

export default function Option(props: Props) {
  const isCoin = !!props.denom

  if (isCoin) {
    const asset = ASSETS.find((asset) => asset.denom === props.denom) || ASSETS[0]
    const balance = props.amount ?? '0'

    if (props.isDisplay) {
      return (
        <div
          className={classNames('flex items-center gap-2 bg-white/10 p-3', 'hover:cursor-pointer')}
        >
          <AssetImage asset={asset} size={20} />
          <span>{asset.symbol}</span>
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
        data-testid='option-component'
        className={classNames(
          'grid grid-flow-row grid-cols-5 grid-rows-2 py-3.5 pr-4',
          'border-b border-b-white/20 last:border-none',
          'hover:cursor-pointer hover:bg-white/20',
          !props.isSelected ? 'bg-white/10' : 'pointer-events-none',
        )}
        onClick={() => props?.onClick && props.onClick(asset.denom)}
      >
        <div className='row-span-2 flex h-full items-center justify-center'>
          <AssetImage asset={asset} size={32} />
        </div>
        <Text className='col-span-2 pb-1'>{asset.symbol}</Text>
        <Text size='sm' className='col-span-2 pb-1 text-right font-bold'>
          {formatValue(balance, {
            decimals: asset.decimals,
            maxDecimals: 4,
            minDecimals: 0,
            rounded: true,
          })}
        </Text>
        <Text size='sm' className='col-span-2 text-white/50'>
          {formatValue(5, { maxDecimals: 2, minDecimals: 0, prefix: 'APY ', suffix: '%' })}
        </Text>
        <Text size='sm' className='col-span-2 text-right text-white/50'>
          <DisplayCurrency coin={{ denom: asset.denom, amount: balance }} />
        </Text>
      </div>
    )
  }

  const label = props.label
  if (props.isDisplay) {
    return (
      <div
        className={classNames(
          'flex w-full items-center justify-between bg-white/10 p-3 hover:cursor-pointer',
        )}
      >
        <span>{label}</span>
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
        'block p-3 hover:cursor-pointer hover:bg-white/20',
        props.isSelected && 'bg-white/10',
      )}
      onClick={() => props?.onClick && props.onClick(props.value)}
    >
      {label}
    </div>
  )
}
