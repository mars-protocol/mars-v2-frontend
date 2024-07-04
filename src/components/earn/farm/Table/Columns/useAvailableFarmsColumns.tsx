import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/earn/farm/Table/Columns/DepositCap'
import FarmApy, { APY_META } from 'components/earn/farm/Table/Columns/FarmApy'
import { DEPOSIT_META, FarmDeposit } from 'components/earn/farm/Table/Columns/FarmDeposit'
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
        cell: ({ row }) => <FarmApy farm={row.original as Farm} assets={assets} />,
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
        cell: ({ row }) => <FarmDeposit farm={row.original as Farm} isLoading={props.isLoading} />,
      },
    ]
  }, [props.isLoading])
}
