import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import AstroLpPositionValue, {
  POSITION_VALUE_META,
} from 'components/earn/farm/astroLp/Table/Columns/AstroLpPositionValue'
import Account, { ACCOUNT_META } from 'components/hls/Farm/Table/Columns/Account'
import Apy, { APY_META } from 'components/hls/Farm/Table/Columns/Apy'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/hls/Farm/Table/Columns/DepositCap'
import Leverage, { LEV_META, leverageSortingFn } from 'components/hls/Farm/Table/Columns/Leverage'
import Manage, { MANAGE_META } from 'components/hls/Farm/Table/Columns/Manage'
import Name, { NAME_META } from 'components/hls/Farm/Table/Columns/Name'
import NetValue, { NET_VAL_META, netValueSorting } from 'components/hls/Farm/Table/Columns/NetValue'

export default function useActiveHlsFarmsColumns(assets: Asset[]) {
  return useMemo<ColumnDef<DepositedHlsFarm>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => (
          <Name farm={row.original.farm as DepositedAstroLp} account={row.original.account} />
        ),
      },
      { ...ACCOUNT_META, cell: ({ row }) => <Account account={row.original.account} /> },
      {
        ...LEV_META,
        cell: ({ row }) => <Leverage leverage={row.original.leverage} />,
        sortingFn: leverageSortingFn,
      },
      {
        ...POSITION_VALUE_META,
        cell: ({ row }: { row: Row<DepositedHlsFarm> }) => (
          <AstroLpPositionValue vault={row.original.farm as DepositedAstroLp} />
        ),
      },
      {
        ...NET_VAL_META,
        cell: ({ row }) => <NetValue netValue={row.original.netValue} />,
        sortingFn: netValueSorting,
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => {
          if (row.original.farm.cap === null) return null
          return <DepositCap farm={row.original} />
        },
        sortingFn: depositCapSortingFn,
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy hlsFarm={row.original} />,
      },
      { ...MANAGE_META, cell: ({ row }) => <Manage hlsFarm={row.original} /> },
    ]
  }, [])
}
