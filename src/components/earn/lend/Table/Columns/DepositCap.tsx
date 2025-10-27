import { Row } from '@tanstack/react-table'
import DepositCapCell from 'components/common/DepositCapCell'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { demagnify } from 'utils/formatters'

export const DEPOSIT_CAP_META = {
  accessorKey: 'marketDepositCap',
  header: () => (
    <div className='flex flex-col text-xs leading-tight'>
      <Text size='xs'>Deposits</Text>
      <Text size='xs' className='text-white/40'>
        Deposit Cap
      </Text>
    </div>
  ),
  id: 'marketDepositCap',
  meta: {
    className: 'w-40 min-w-30',
  },
}

export const marketDepositCapSortingFn = (
  a: Row<LendingMarketTableData>,
  b: Row<LendingMarketTableData>,
): number => {
  const assetA = a.original.asset
  const assetB = b.original.asset
  if (!a.original.cap || !b.original.cap) return 0
  if (!a.original.cap.max || !b.original.cap.max) return 0

  const marketDepositCapA = demagnify(a.original.cap.max, assetA)
  const marketDepositCapB = demagnify(b.original.cap.max, assetB)
  return marketDepositCapA - marketDepositCapB
}

interface Props {
  isLoading: boolean
  data: LendingMarketTableData
}
export default function DepositCap(props: Props) {
  if (props.isLoading) return <Loading />
  const { cap } = props.data
  if (!cap) return null

  return <DepositCapCell depositCap={cap} />
}
