import { Row } from '@tanstack/react-table'

import Text from 'components/common/Text'
import { formatPercent } from 'utils/formatters'

export const BORROW_RATE_META = {
  id: 'asset.borrowRate',
  header: 'Borrow Rate',
  accessorKey: 'market.apy.borrow',
}

interface Props {
  row: Row<AssetTableRow>
}

export default function BorrowRate(props: Props) {
  const { row } = props
  const borrowRate = row.original.market?.apy.borrow ?? 0

  return (
    <Text size='sm' className='mb-0.5 text-white'>
      {formatPercent(borrowRate)}
    </Text>
  )
}
