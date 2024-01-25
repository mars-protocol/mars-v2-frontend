import { Row } from '@tanstack/react-table'

import Text from 'components/common/Text'
import { formatPercent } from 'utils/formatters'

export const BORROW_RATE_META = {
  id: 'asset.borrowRate',
  header: 'BorrowRate',
  accessorKey: 'asset.borrowRate',
}

interface Props {
  row: Row<AssetTableRow>
}

export default function BorrowRate(props: Props) {
  const { row } = props
  const asset = row.original.asset as BorrowAsset

  return (
    <Text size='sm' className='mb-0.5 text-white'>
      {formatPercent(asset.borrowRate ?? 0)}
    </Text>
  )
}
