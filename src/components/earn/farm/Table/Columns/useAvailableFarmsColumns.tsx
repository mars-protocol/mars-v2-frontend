import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/earn/farm/Table/Columns/Apy'
import { Deposit, DEPOSIT_META } from 'components/earn/farm/Table/Columns/Deposit'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/earn/farm/Table/Columns/DepositCap'
import MaxLTV, { LTV_MAX_META } from 'components/earn/farm/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/earn/farm/Table/Columns/Name'
import TVL, { TVL_META } from 'components/earn/farm/Table/Columns/TVL'
import useAssets from 'hooks/assets/useAssets'

interface Props {
  isLoading: boolean
}

export default function useAvailableFarmsColumns(props: Props) {
  const { data: assets } = useAssets()
  return useMemo<ColumnDef<Farm | DepositedFarm>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as Farm} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => <Apy vault={row.original as Farm} assets={assets} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            denom={(row.original as Farm).cap?.denom}
            amount={(row.original as Farm).cap?.used}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap vault={row.original as Farm} isLoading={props.isLoading} />,
        sortingFn: depositCapSortingFn,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original as Farm} />,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => <Deposit vault={row.original as Farm} isLoading={props.isLoading} />,
      },
    ]
  }, [props.isLoading])
}
