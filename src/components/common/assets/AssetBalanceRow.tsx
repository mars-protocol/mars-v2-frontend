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
  hideBalances?: boolean
  hideNames?: boolean
  small?: boolean
  tiny?: boolean
}

export default function AssetBalanceRow(props: Props) {
  const { asset, coin, className, hideBalances, hideNames, small, tiny } = props
  return (
    <div
      className={classNames(
        'flex items-center w-full',
        small || tiny ? 'gap-2' : 'gap-4',
        className,
      )}
    >
      <AssetImage asset={asset} className={classNames(small || tiny ? 'w-5 h-5' : 'w-8 h-8')} />
      {!tiny && (
        <div className='flex flex-wrap flex-1'>
          <Text className='w-full' size={small ? 'sm' : 'base'}>
            {asset.symbol}
          </Text>
          {!hideBalances && !hideNames && (
            <Text size={small || tiny ? 'xs' : 'sm'} className='w-full text-white/50'>
              {asset.name}
            </Text>
          )}
        </div>
      )}
      <div className='flex flex-wrap'>
        {!hideBalances && (
          <DisplayCurrency
            coin={coin}
            className={classNames(
              'w-full',
              (small || tiny) && 'text-sm',
              tiny ? '!justify-start' : 'text-right',
            )}
          />
        )}
        <FormattedNumber
          amount={demagnify(coin.amount, asset)}
          className={classNames(
            'w-full',
            !tiny && 'text-right',
            !hideBalances && 'text-white/50',
            small || tiny ? 'text-xs' : 'text-sm',
          )}
          options={{ suffix: ` ${asset.symbol}`, maxDecimals: asset.decimals }}
        />
      </div>
    </div>
  )
}
