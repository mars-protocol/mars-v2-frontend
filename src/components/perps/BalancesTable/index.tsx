import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { SearchParams } from '../../../types/enums'
import { getSearchParamsObject } from '../../../utils/route'
import Table from '../../common/Table'
import usePerpsBalancesColumns from './Columns/usePerpsBalancesColumns'
import usePerpsBalancesData from './usePerpsBalancesData'

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
