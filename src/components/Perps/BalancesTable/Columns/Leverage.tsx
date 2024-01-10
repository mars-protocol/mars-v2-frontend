import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'

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
  leverage: number
}

export default function Leverage(props: Props) {
  return (
    <TitleAndSubCell
      title={
        <FormattedNumber amount={props.liquidationPrice.toNumber()} options={{ prefix: '$' }} />
      }
      sub={<FormattedNumber amount={props.leverage} options={{ suffix: 'x' }} />}
    />
  )
}
