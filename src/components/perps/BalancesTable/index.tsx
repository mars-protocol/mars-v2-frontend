import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { SearchParams } from 'types/enums'
import Table from 'components/common/Table'
import usePerpsBalancesColumns from 'components/perps/BalancesTable/Columns/usePerpsBalancesColumns'
import usePerpsBalancesData from 'components/perps/BalancesTable/usePerpsBalancesData'
import { getSearchParamsObject } from 'utils/route'

export default function PerpsBalancesTable() {
  const data = usePerpsBalancesData()
  const columns = usePerpsBalancesColumns()
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

  if (!data.length) return null
  return (
    <Table
      title='Perp Positions'
      columns={columns}
      data={data}
      initialSorting={[]}
      onClickRow={onClickRow}
    />
  )
}
