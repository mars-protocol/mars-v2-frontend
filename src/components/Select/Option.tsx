import classNames from 'classnames'

import AssetImage from 'components/Asset/AssetImage'
import AssetRate from 'components/Asset/AssetRate'
import DisplayCurrency from 'components/DisplayCurrency'
import { ChevronDown, ChevronRight } from 'components/Icons'
import Text from 'components/Text'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import useMarketAssets from 'hooks/markets/useMarketAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatValue } from 'utils/formatters'

interface Props extends SelectOption {
  isSelected?: boolean
  isDisplay?: boolean
  isClicked?: boolean
  onClick?: (value: string) => void
  displayClassName?: string
}

export default function Option(props: Props) {
  const isCoin = !!props.denom
  const { data: marketAssets } = useMarketAssets()
  const asset = useAsset(props.denom || '')

  function handleOnClick(value: string | undefined) {
    if (!props.onClick || !value) return
    props.onClick(value)
  }

  if (isCoin) {
    const balance = props.amount ?? BN_ZERO
    const marketAsset = marketAssets.find(byDenom(props.denom || ''))

    if (!asset || !marketAsset) return null

    if (props.isDisplay) {
      return (
        <div
          className={classNames(
            'flex h-full w-auto items-center gap-2 bg-white/10 px-2',
            'hover:cursor-pointer',
            props.displayClassName,
          )}
        >
          <AssetImage asset={asset} size={20} />
          <span className='flex'>{asset.symbol}</span>
          <ChevronRight
            className={classNames(
              'block h-3 w-1.5 transition-transform',
              props.isClicked ? 'rotate-90' : 'rotate-0',
            )}
          />
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
        onClick={() => handleOnClick(asset.denom)}
      >
        <div className='flex items-center justify-center h-full row-span-2'>
          <AssetImage asset={asset} size={32} />
        </div>
        <Text className='col-span-2 pb-1'>{asset.symbol}</Text>
        <Text size='sm' className='col-span-2 pb-1 font-bold text-right'>
          {formatValue(balance.toString(), {
            decimals: asset.decimals,
            maxDecimals: 4,
            minDecimals: 0,
            rounded: true,
          })}
        </Text>
        <AssetRate
          rate={marketAsset?.apy.borrow ?? 0}
          isEnabled={marketAsset?.borrowEnabled ?? false}
          className='col-span-2 text-white/50'
          type='apy'
          orientation='rtl'
          suffix
        />
        <DisplayCurrency
          className='col-span-2 text-sm text-right text-white/50'
          coin={BNCoin.fromDenomAndBigNumber(asset.denom, balance)}
        />
      </div>
    )
  }

  if (props.isDisplay) {
    return (
      <div
        className={classNames('flex w-full items-center justify-between p-3 hover:cursor-pointer')}
      >
        <span className='flex flex-1'>{props.label}</span>
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
      onClick={() => handleOnClick(props.value)}
    >
      {props.label}
    </div>
  )
}
