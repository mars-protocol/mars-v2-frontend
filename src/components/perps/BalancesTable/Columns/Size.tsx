import { Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { demagnify } from 'utils/formatters'

export const SIZE_META = {
  accessorKey: 'size',
  header: () => (
    <div className='flex flex-col gap-1'>
      <Text size='xs'>Size</Text>
    </div>
  ),
}

export const sizeSortingFn = (a: Row<PerpPositionRow>, b: Row<PerpPositionRow>): number => {
  return a.original.amount.abs().minus(b.original.amount.abs()).toNumber()
}

type Props = {
  amount: BigNumber
  asset: Asset
}

export default function Size(props: Props) {
  const amount = useMemo(
    () => demagnify(props.amount.abs().toString(), props.asset),
    [props.asset, props.amount],
  )

  return (
    <FormattedNumber
      amount={amount}
      options={{ maxDecimals: amount < 0.0001 ? props.asset.decimals : 4 }}
      className='text-xs'
    />
  )
}
