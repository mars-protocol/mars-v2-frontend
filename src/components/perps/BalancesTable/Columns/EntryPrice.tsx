import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { getPerpsPriceDecimals } from 'utils/formatters'

export const ENTRY_PRICE_META = (isOrderTable: boolean) => {
  return {
    accessorKey: 'entryPrice',
    header: () => (
      <div className='flex flex-col gap-1'>
        <Text size='xs'>{isOrderTable ? 'Trigger Condition' : 'Entry Price'}</Text>
        <Text size='xs' className='text-white/40'>
          Current Price
        </Text>
      </div>
    ),
    meta: { className: 'min-w-48 w-48' },
  }
}

type Props = {
  entryPrice: BigNumber
  currentPrice: BigNumber
  asset: Asset
  type: string
  tradeDirection: 'long' | 'short'
}

export default function EntryPrice(props: Props) {
  const entryPrice = props.entryPrice.shiftedBy(props.asset.decimals - PRICE_ORACLE_DECIMALS)
  const currentPrice = props.currentPrice.shiftedBy(props.asset.decimals - PRICE_ORACLE_DECIMALS)

  const getDisplayValue = () => {
    const priceDisplay = (
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber('usd', entryPrice)}
        options={{
          maxDecimals: getPerpsPriceDecimals(entryPrice),
          abbreviated: false,
        }}
        showDetailedPrice
      />
    )

    if (props.type === 'market') {
      return <div className='flex flex-col items-end gap-1'>{priceDisplay}</div>
    }

    if (props.type === 'limit') {
      return (
        <div className='flex flex-col items-end gap-1'>
          <div className='flex items-center gap-1'>
            <Text size='xs'>{props.tradeDirection === 'long' ? '<=' : '>='}</Text>
            {priceDisplay}
          </div>
        </div>
      )
    }

    if (props.type === 'stop') {
      return (
        <div className='flex flex-col items-end gap-1'>
          <div className='flex items-center gap-1'>
            <Text size='xs'>{props.tradeDirection === 'long' ? '>=' : '<='}</Text>
            {priceDisplay}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <TitleAndSubCell
      title={getDisplayValue()}
      sub={
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber('usd', currentPrice)}
          options={{
            maxDecimals: getPerpsPriceDecimals(currentPrice),
            minDecimals: getPerpsPriceDecimals(currentPrice),
            abbreviated: false,
          }}
          showDetailedPrice
        />
      }
    />
  )
}
