import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'

interface Props {
  asset: Asset
  coin: BNCoin
  className?: string
  small?: boolean
  hideBalances?: boolean
  hideNames?: boolean
}

export default function AssetBalanceRow(props: Props) {
  return (
    <div
      className={classNames(
        'flex items-center w-full',
        props.small ? 'gap-2' : 'gap-4',
        props.className,
      )}
    >
      <AssetImage asset={props.asset} className={classNames(props.small ? 'w-5 h-5' : 'w-8 h-8')} />
      <div className='flex flex-wrap flex-1'>
        <Text className='w-full' size={props.small ? 'sm' : 'base'}>
          {props.asset.symbol}
        </Text>
        {!props.hideBalances && !props.hideNames && (
          <Text size={props.small ? 'xs' : 'sm'} className='w-full text-white/50'>
            {props.asset.name}
          </Text>
        )}
      </div>
      <div className='flex flex-wrap'>
        {!props.hideBalances && (
          <DisplayCurrency
            coin={props.coin}
            className={classNames('w-full text-right', props.small && 'text-sm')}
          />
        )}
        <FormattedNumber
          amount={demagnify(props.coin.amount, props.asset)}
          className={classNames(
            'w-full text-right',
            !props.hideBalances && 'text-white/50',
            props.small ? 'text-xs' : 'text-sm',
          )}
          options={{ suffix: ` ${props.asset.symbol}`, maxDecimals: props.asset.decimals }}
          animate
        />
      </div>
    </div>
  )
}
