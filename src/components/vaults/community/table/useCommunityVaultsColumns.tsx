import { ColumnDef } from '@tanstack/react-table'
import React, { useMemo } from 'react'
import Name, { NAME_META } from 'components/vaults/common/table/columns/Name'
import Fee, { FEE_META } from 'components/vaults/common/table/columns/Fee'
import Tvl, { TVL_META } from 'components/vaults/common/table/columns/Tvl'
import Apy, { APY_META } from 'components/vaults/common/table/columns/Apy'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/vaults/common/table/columns/FreezePeriod'
import Details, { DETAILS_META } from 'components/vaults/community/table/column/Details'

interface Props {
  isLoading: boolean
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading } = props

  return useMemo<ColumnDef<Vaults>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name value={row.original as Vaults} isLoading={isLoading} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => <Tvl value={row.original.tvl} isLoading={isLoading} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy value={row.original.apy} isLoading={isLoading} />,
      },
      {
        ...FEE_META,
        cell: ({ row }) => <Fee value={row.original.fee} isLoading={isLoading} />,
      },
      {
        ...FREEZE_PERIOD_META,
        cell: ({ row }) => <FreezePeriod value={row.original.freezePeriod} isLoading={isLoading} />,
      },
      {
        ...DETAILS_META,
        cell: () => <Details isLoading={isLoading} />,
      },
    ],
    [isLoading],
  )
}
