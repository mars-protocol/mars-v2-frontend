import { Row } from '@tanstack/react-table'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { demagnify } from 'utils/formatters'

export const DEPOSIT_CAP_META = {
  accessorKey: 'marketDepositCap',
  header: 'Deposit Cap',
  id: 'marketDepositCap',
  meta: { className: 'w-40' },
}

export const marketDepositCapSortingFn = (
  a: Row<LendingMarketTableData>,
  b: Row<LendingMarketTableData>,
): number => {
  const assetA = a.original.asset
  const assetB = b.original.asset
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
  const { cap, asset } = props.data
  const percent = cap.used.dividedBy(cap.max).multipliedBy(100)
  const depositCapUsed = Math.min(percent.toNumber(), 100)

  return (
    <TitleAndSubCell
      className='text-xs'
      title={
        <FormattedNumber
          amount={cap.max.toNumber()}
          options={{ abbreviated: true, decimals: asset.decimals }}
          animate
        />
      }
      sub={
        <FormattedNumber
          amount={depositCapUsed}
          options={{ minDecimals: 2, maxDecimals: 2, suffix: '% used' }}
          animate
        />
      }
    />
  )
}
