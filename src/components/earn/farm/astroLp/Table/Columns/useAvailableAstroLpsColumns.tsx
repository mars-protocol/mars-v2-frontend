import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/common/Table/Columns/DepositCap'
import MaxLTV, { LTV_MAX_META } from 'components/common/Table/Columns/MaxLTV'
import Name, { NAME_META } from 'components/common/Table/Columns/Name'
import TVL, { TVL_META } from 'components/common/Table/Columns/TVL'
import useAssets from 'hooks/assets/useAssets'
import AstroLpApy, { APY_META } from './AstroLpApy'
import { AstroLpDeposit, DEPOSIT_META } from './AstroLpDeposit'

interface Props {
  isLoading: boolean
}

export default function useAvailableAstroLpColumns(props: Props) {
  const { data: assets } = useAssets()
  return useMemo<ColumnDef<AstroLp | DepositedAstroLp>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as AstroLp} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => <AstroLpApy astroLp={row.original as AstroLp} assets={assets} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            denom={(row.original as AstroLp).cap?.denom}
            amount={(row.original as AstroLp).cap?.used}
          />
        ),
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => (
          <DepositCap vault={row.original as AstroLp} isLoading={props.isLoading} />
        ),
        sortingFn: depositCapSortingFn,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original as AstroLp} />,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => (
          <AstroLpDeposit astroLp={row.original as AstroLp} isLoading={props.isLoading} />
        ),
      },
    ]
  }, [props.isLoading, assets])
}
