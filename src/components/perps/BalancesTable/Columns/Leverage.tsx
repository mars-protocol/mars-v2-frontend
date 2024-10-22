import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

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
}

type Props = {
  liquidationPrice: BigNumber
  leverage: number | null
}

export default function Leverage(props: Props) {
  return (
    <TitleAndSubCell
      title={props.liquidationPrice.toString() ?? '-'}
      sub={
        props.leverage ? <FormattedNumber amount={props.leverage} options={{ suffix: 'x' }} /> : ''
      }
    />
  )
}
