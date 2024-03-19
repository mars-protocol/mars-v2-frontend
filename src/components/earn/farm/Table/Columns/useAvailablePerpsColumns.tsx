import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import CollateralizationRatio, {
  COLL_META,
} from 'components/earn/farm/Table/Columns/CollateralizationRatio'
import { Deposit, DEPOSIT_META } from 'components/earn/farm/Table/Columns/Deposit'
import { NAME_META } from 'components/earn/farm/Table/Columns/Name'
import { PerpsName } from 'components/earn/farm/Table/Columns/PerpsName'
import TVL, { TVL_META } from 'components/earn/farm/Table/Columns/TVL'

interface Props {
  isLoading: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<PerpsVault>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <PerpsName vault={row.original as PerpsVault} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            denom={(row.original as PerpsVault).denom}
            amount={(row.original as PerpsVault).liquidity}
          />
        ),
      },
      {
        ...COLL_META,
        cell: ({ row }) => (
          <CollateralizationRatio amount={(row.original as PerpsVault).collateralizationRatio} />
        ),
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => (
          <Deposit vault={row.original as PerpsVault} isLoading={props.isLoading} isPerps />
        ),
      },
    ]
  }, [props.isLoading])
}
