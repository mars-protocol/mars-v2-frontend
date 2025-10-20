import classNames from 'classnames'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { ChevronDown, ChevronRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import AssetRate from 'components/common/assets/AssetRate'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import useMarkets from 'hooks/markets/useMarkets'
import { BNCoin } from 'types/classes/BNCoin'
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
  const markets = useMarkets()

  const asset = useAsset(props.denom || '')

  function handleOnClick(value: string | undefined) {
    if (!props.onClick || !value) return
    props.onClick(value)
  }

  if (isCoin) {
    const balance = props.amount ?? BN_ZERO
    const marketAsset = markets.find((market) => market.asset.denom === props.denom)

    if (!asset) return null

    if (props.isDisplay) {
      return (
        <div
          className={classNames(
            'flex h-full w-auto items-center gap-2  px-2',
            'hover:cursor-pointer',
            props.displayClassName,
          )}
        >
          <AssetImage asset={asset} className='w-5 h-5' />
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
          'flex gap-4 justify-between items-center py-2 px-4',
          'border-b border-b-white/20 last:border-none',
          'hover:cursor-pointer hover:bg-white/10',
          !props.isSelected ? '' : 'pointer-events-none',
        )}
        onClick={() => handleOnClick(asset.denom)}
      >
        <div className='flex items-center justify-center gap-4'>
          <AssetImage asset={asset} className='w-8 h-8' />
          <div className='flex flex-col gap-1'>
            <Text size='sm'>{asset.symbol}</Text>
            <AssetRate
              rate={marketAsset?.apy.borrow ?? 0}
              isEnabled={marketAsset?.borrowEnabled ?? false}
              className='text-sm text-white/50'
              type='apy'
              orientation='rtl'
              suffix
              hasCampaignApy={asset.campaigns.find((c) => c.type === 'apy') !== undefined}
            />
          </div>
        </div>
        <div className='flex flex-col gap-2 items-end'>
          <Text size='sm' className='font-bold'>
            {formatValue(balance.toString(), {
              decimals: asset.decimals,
              maxDecimals: 4,
              minDecimals: 0,
              rounded: true,
            })}
          </Text>
          <DisplayCurrency
            className='text-sm text-white/50'
            coin={BNCoin.fromDenomAndBigNumber(asset.denom, balance)}
          />
        </div>
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
        'block p-3 hover:cursor-pointer hover:bg-white/10',
        props.isSelected && '',
      )}
      onClick={() => handleOnClick(props.value)}
    >
      {props.label}
    </div>
  )
}
