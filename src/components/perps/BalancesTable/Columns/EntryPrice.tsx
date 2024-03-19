import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

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
  return (
    <TitleAndSubCell
      title={<FormattedNumber amount={props.entryPrice.toNumber()} options={{ prefix: '$' }} />}
      sub={<FormattedNumber amount={props.currentPrice.toNumber()} options={{ prefix: '$' }} />}
    />
  )
}
