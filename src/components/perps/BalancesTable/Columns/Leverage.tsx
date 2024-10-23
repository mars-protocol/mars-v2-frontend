import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { formatValue } from 'utils/formatters'

export const LEVERAGE_META = {
  accessorKey: 'leverage',
  header: () => (
    <div className='flex flex-col gap-1'>
      <Text size='xs'>Liquidation Price</Text>
      <Text size='xs' className='text-white/40'>
        Leverage
      </Text>
    </div>
  ),
  meta: { className: 'min-w-40' },
}

type Props = {
  liquidationPrice: BigNumber
  leverage: number | null
}

export default function Leverage(props: Props) {
  const liqPrice = props.liquidationPrice.isGreaterThan(10)
    ? formatValue(props.liquidationPrice.toNumber(), { maxDecimals: 2, abbreviated: false })
    : formatValue(props.liquidationPrice.toNumber(), { maxDecimals: 6, abbreviated: false })

  return (
    <TitleAndSubCell
      title={liqPrice.toString() ?? '-'}
      sub={
        props.leverage ? <FormattedNumber amount={props.leverage} options={{ suffix: 'x' }} /> : ''
      }
    />
  )
}
