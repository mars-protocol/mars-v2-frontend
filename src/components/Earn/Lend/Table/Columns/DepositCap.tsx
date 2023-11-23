import { Row } from '@tanstack/react-table'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { demagnify } from 'utils/formatters'

export const DEPOSIT_CAP_META = {
  accessorKey: 'marketDepositCap',
  header: 'Deposit Cap',
  id: 'marketDepositCap',
}

export const marketDepositCapSortingFn = (
  a: Row<LendingMarketTableData>,
  b: Row<LendingMarketTableData>,
): number => {
  const assetA = a.original.asset
  const assetB = b.original.asset
  if (!a.original.marketDepositCap || !b.original.marketDepositCap) return 0

  const marketDepositCapA = demagnify(a.original.marketDepositCap, assetA)
  const marketDepositCapB = demagnify(b.original.marketDepositCap, assetB)
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
          amount={percent.toNumber()}
          options={{ minDecimals: 2, maxDecimals: 2, suffix: '% used' }}
          animate
        />
      }
    />
  )
}
