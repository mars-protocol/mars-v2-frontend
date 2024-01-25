import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import usePrice from 'hooks/usePrice'
import { demagnify } from 'utils/formatters'

export const SIZE_META = {
  accessorKey: 'size',
  header: () => (
    <div className='flex flex-col gap-1'>
      <Text size='xs'>Size</Text>
      <Text size='xs' className='text-white/40'>
        Value
      </Text>
    </div>
  ),
}

type Props = {
  amount: BigNumber
  asset: Asset
}

export default function Size(props: Props) {
  const price = usePrice(props.asset.denom)

  const amount = useMemo(
    () => demagnify(props.amount.toString(), props.asset),
    [props.asset, props.amount],
  )
  const value = useMemo(() => price.times(amount).toNumber(), [amount, price])
  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={amount}
          options={{ maxDecimals: amount < 0.0001 ? props.asset.decimals : 4 }}
        />
      }
      sub={<FormattedNumber amount={value} options={{ prefix: '$' }} />}
    />
  )
}