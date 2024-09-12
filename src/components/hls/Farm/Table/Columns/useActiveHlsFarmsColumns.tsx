import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import AstroLpApy, { APY_META } from 'components/earn/farm/astroLp/Table/Columns/AstroLpApy'
import AstroLpManage, {
  MANAGE_META,
} from 'components/earn/farm/astroLp/Table/Columns/AstroLpManage'
import AstroLpPositionValue, {
  POSITION_VALUE_META,
} from 'components/earn/farm/astroLp/Table/Columns/AstroLpPositionValue'
import MaxLTV, { LTV_MAX_META } from 'components/earn/farm/common/Table/Columns/MaxLTV'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/hls/Farm/Table/Columns/DepositCap'
import Name, { NAME_META } from 'components/hls/Farm/Table/Columns/Name'

export default function useActiveHlsFarmsColumns(assets: Asset[]) {
  return useMemo<ColumnDef<DepositedHlsFarm>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name farm={row.original.farm as DepositedAstroLp} />,
      },
      {
        ...POSITION_VALUE_META,
        cell: ({ row }: { row: Row<DepositedHlsFarm> }) => (
          <AstroLpPositionValue vault={row.original.farm as DepositedAstroLp} />
        ),
      },
      {
        ...APY_META,
        cell: ({ row }) => <AstroLpApy astroLp={row.original.farm as AstroLp} assets={assets} />,
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
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original.farm as DepositedAstroLp} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => (
          <AstroLpManage astroLp={row.original.farm} isExpanded={row.getIsExpanded()} />
        ),
      },
    ]
  }, [assets])
}
