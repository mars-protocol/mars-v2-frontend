import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'
import Chevron, { CHEVRON_META } from 'components/earn/lend/Table/Columns/Chevron'
import DepositCap, {
  DEPOSIT_CAP_META,
  marketDepositCapSortingFn,
} from 'components/earn/lend/Table/Columns/DepositCap'
import LendButton, { LEND_BUTTON_META } from 'components/earn/lend/Table/Columns/LendButton'
import Name, { NAME_META } from 'components/earn/lend/Table/Columns/Name'

interface Props {
  isLoading: boolean
  v1?: boolean
}

export default function useAvailableColumns(props: Props) {
  return useMemo<ColumnDef<LendingMarketTableData>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name asset={row.original.asset} v1={props.v1} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy
            isLoading={props.isLoading}
            borrowEnabled={row.original.borrowEnabled}
            apy={row.original.apy.deposit}
            campaigns={row.original.asset.campaigns}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap isLoading={props.isLoading} data={row.original} />,
        sortingFn: marketDepositCapSortingFn,
      },
      {
        ...LEND_BUTTON_META,
        cell: ({ row }) => <LendButton data={row.original} />,
      },
      {
        ...CHEVRON_META,
        cell: ({ row }) => <Chevron isExpanded={row.getIsExpanded()} />,
      },
    ]
  }, [props.isLoading, props.v1])
}
