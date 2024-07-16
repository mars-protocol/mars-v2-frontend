import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/earn/farm/Table/Columns/DepositCap'
import FarmApy, { APY_META } from 'components/earn/farm/Table/Columns/FarmApy'
import FarmManage, { MANAGE_META } from 'components/earn/farm/Table/Columns/FarmManage'
import FarmPositionValue, {
  POSITION_VALUE_META,
} from 'components/earn/farm/Table/Columns/FarmPositionValue'
import MaxLTV, { LTV_MAX_META } from 'components/earn/farm/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/earn/farm/Table/Columns/Name'
import TVL, { TVL_META } from 'components/earn/farm/Table/Columns/TVL'

export default function useActiveFarmsColumns(assets: Asset[]) {
  return useMemo<ColumnDef<DepositedFarm>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as DepositedFarm} />,
      },
      {
        ...POSITION_VALUE_META,
        cell: ({ row }: { row: Row<DepositedFarm> }) => (
          <FarmPositionValue vault={row.original as DepositedFarm} />
        ),
      },
      {
        ...APY_META,
        cell: ({ row }) => <FarmApy farm={row.original as Farm} assets={assets} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            denom={(row.original as DepositedFarm).cap?.denom}
            amount={(row.original as DepositedFarm).cap?.used}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => {
          if (row.original.cap === null) return null
          return <DepositCap vault={row.original as DepositedFarm} />
        },
        sortingFn: depositCapSortingFn,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original as DepositedFarm} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => <FarmManage farm={row.original} isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [assets])
}
