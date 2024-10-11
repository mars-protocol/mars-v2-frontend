import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'

export const ENTRY_PRICE_META = {
  accessorKey: 'entryPrice',
  header: () => (
    <div className='flex flex-col gap-1'>
      <Text size='xs'>Entry Price</Text>
      <Text size='xs' className='text-white/40'>
        Current Price
      </Text>
    </div>
  ),
}

type Props = {
  entryPrice: BigNumber
  currentPrice: BigNumber
  asset: Asset
}

export default function EntryPrice(props: Props) {
  const entryPrice = props.entryPrice.shiftedBy(props.asset.decimals - PRICE_ORACLE_DECIMALS)

  const currentPrice = props.currentPrice.shiftedBy(props.asset.decimals - PRICE_ORACLE_DECIMALS)

  return (
    <TitleAndSubCell
      title={
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber('usd', entryPrice ?? 0)}
          options={{ maxDecimals: entryPrice.isGreaterThanOrEqualTo(10) ? 2 : 6 }}
        />
      }
      sub={
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber('usd', currentPrice ?? 0)}
          options={{ maxDecimals: entryPrice.isGreaterThanOrEqualTo(10) ? 2 : 6 }}
        />
      }
    />
  )
}
