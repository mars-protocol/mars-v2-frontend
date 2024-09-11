import { FormattedNumber } from '../../../common/FormattedNumber'
import Text from '../../../common/Text'
import TitleAndSubCell from '../../../common/TitleAndSubCell'

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
  const entryPrice = props.entryPrice.toNumber()
  const currentPrice = props.currentPrice.toNumber()
  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={entryPrice}
          options={{ prefix: '$', maxDecimals: entryPrice >= 100 ? 2 : 6 }}
        />
      }
      sub={
        <FormattedNumber
          amount={currentPrice}
          options={{ prefix: '$', maxDecimals: currentPrice >= 100 ? 2 : 6 }}
        />
      }
    />
  )
}
