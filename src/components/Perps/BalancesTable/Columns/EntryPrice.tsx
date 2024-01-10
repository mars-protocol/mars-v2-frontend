import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import usePrice from 'hooks/usePrice'

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
  asset: Asset
}

export default function EntryPrice(props: Props) {
  const price = usePrice(props.asset.denom)

  return (
    <TitleAndSubCell
      title={<FormattedNumber amount={props.entryPrice.toNumber()} options={{ prefix: '$' }} />}
      sub={<FormattedNumber amount={price.toNumber()} options={{ prefix: '$' }} />}
    />
  )
}
