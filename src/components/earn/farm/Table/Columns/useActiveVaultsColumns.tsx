import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/earn/farm/Table/Columns/Apy'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/earn/farm/Table/Columns/DepositCap'
import VaultManage, { MANAGE_META } from 'components/earn/farm/Table/Columns/VaultManage'
import MaxLTV, { LTV_MAX_META } from 'components/earn/farm/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/earn/farm/Table/Columns/Name'
import TVL, { TVL_META } from 'components/earn/farm/Table/Columns/TVL'
import VaultPositionValue, {
  POSITION_VALUE_META,
} from 'components/earn/farm/Table/Columns/VaultPositionValue'

export default function useActiveVaultsColumns() {
  return useMemo<ColumnDef<DepositedVault>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as DepositedVault} />,
      },
      {
        ...POSITION_VALUE_META,
        cell: ({ row }: { row: Row<DepositedVault> }) => (
          <VaultPositionValue vault={row.original as DepositedVault} />
        ),
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy vault={row.original as DepositedVault} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            denom={(row.original as DepositedVault).cap?.denom}
            amount={(row.original as DepositedVault).cap?.used}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => {
          if (row.original.cap === null || row.original.type === 'perp') return null
          return <DepositCap vault={row.original as DepositedVault} />
        },
        sortingFn: depositCapSortingFn,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original as DepositedVault} />,
      },
      {
        ...MANAGE_META,
        cell: ({ row }) => (
          <VaultManage
            vault={row.original}
            isExpanded={row.getIsExpanded()}
            isPerps={row.original.type === 'perp'}
          />
        ),
      },
    ]
  }, [])
}
