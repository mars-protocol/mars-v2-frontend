import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import Table from 'components/common/Table'
import usePerpsBalancesColumns from 'components/perps/BalancesTable/Columns/usePerpsBalancesColumns'
import usePerpsBalancesData from 'components/perps/BalancesTable/usePerpsBalancesData'
import usePerpsLimitOrderRows from 'hooks/perps/usePerpsLimitOrdersRows'
import { SearchParams } from 'types/enums'
import { getSearchParamsObject } from 'utils/route'

export default function PerpsBalancesTable() {
  const activePerpsPositions = usePerpsBalancesData()
  const activeLimitOrders = usePerpsLimitOrderRows()
  const columns = usePerpsBalancesColumns({ isOrderTable: false })
  const limitOrderColumns = usePerpsBalancesColumns({ isOrderTable: true })
  const [searchParams, setSearchParams] = useSearchParams()

  const onClickRow = useCallback(
    (denom: string) => {
      const params = getSearchParamsObject(searchParams)
      setSearchParams({
        ...params,
        [SearchParams.PERPS_MARKET]: denom,
      })
    },
    [searchParams, setSearchParams],
  )

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Perp Positions',
        renderContent: () => (
          <Table
            title='Perp Positions'
            columns={columns}
            data={activePerpsPositions}
            initialSorting={[]}
            onClickRow={onClickRow}
            hideCard
          />
        ),
      },
      {
        title: 'Open Limit Orders',
        notificationCount: activeLimitOrders.length > 0 ? activeLimitOrders.length : undefined,
        renderContent: () => (
          <Table
            title='Open Limit Orders'
            columns={limitOrderColumns}
            data={activeLimitOrders}
            initialSorting={[]}
            onClickRow={onClickRow}
            hideCard
          />
        ),
      },
    ],
    [activeLimitOrders, columns, activePerpsPositions, onClickRow, limitOrderColumns],
  )

  if (!activePerpsPositions.length && !activeLimitOrders.length) return null
  return <CardWithTabs tabs={tabs} />
}
