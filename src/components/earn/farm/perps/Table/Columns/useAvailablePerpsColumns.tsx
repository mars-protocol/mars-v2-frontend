import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import CollateralizationRatio, {
  COLL_META,
} from 'components/earn/farm/common/Table/Columns/CollateralizationRatio'
import { Deposit, DEPOSIT_META } from 'components/earn/farm/common/Table/Columns/Deposit'
import { NAME_META } from 'components/earn/farm/common/Table/Columns/Name'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import { PerpsName } from 'components/earn/farm/perps/Table/Columns/PerpsName'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'

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
        ...APY_META,
        cell: ({ row }) => (
          <Apy isLoading={props.isLoading} borrowEnabled={true} apy={row.original.apy ?? 0} />
        ),
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
