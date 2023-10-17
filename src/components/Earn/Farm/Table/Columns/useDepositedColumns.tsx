import { ColumnDef, Row } from '@tanstack/react-table'
import React, { useMemo } from 'react'

import Apy from 'components/Earn/Farm/Table/Columns/Apy'
import DepositCap from 'components/Earn/Farm/Table/Columns/DepositCap'
import Details from 'components/Earn/Farm/Table/Columns/Details'
import MaxLTV from 'components/Earn/Farm/Table/Columns/MaxLTV'
import Name from 'components/Earn/Farm/Table/Columns/Name'
import PositionValue from 'components/Earn/Farm/Table/Columns/PositionValue'
import TVL from 'components/Earn/Farm/Table/Columns/TVL'

interface Props {
  isLoading: boolean
}

export default function useDepositedColumns(props: Props) {
  return useMemo<ColumnDef<DepositedVault>[]>(() => {
    return [
      {
        header: 'Vault',
        accessorKey: 'name',
        cell: ({ row }) => <Name vault={row.original as DepositedVault} />,
      },
      {
        header: 'Pos. Value',
        cell: ({ row }: { row: Row<DepositedVault> }) => (
          <PositionValue vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
      },
      {
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => <Apy vault={row.original as DepositedVault} />,
      },
      {
        accessorKey: 'tvl',
        header: 'TVL',
        cell: ({ row }) => (
          <TVL vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
      },
      {
        accessorKey: 'cap',
        header: 'Deposit Cap',
        cell: ({ row }) => (
          <DepositCap vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
      },
      {
        accessorKey: 'ltv.max',
        header: 'Max LTV',
        cell: ({ row }) => (
          <MaxLTV vault={row.original as DepositedVault} isLoading={props.isLoading} />
        ),
      },
      {
        accessorKey: 'details',
        enableSorting: false,
        header: 'Details',
        cell: ({ row }) => <Details isLoading={props.isLoading} isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [props.isLoading])
}
