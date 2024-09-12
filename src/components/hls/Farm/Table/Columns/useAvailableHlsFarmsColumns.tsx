import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import AstroLpApy, { APY_META } from 'components/earn/farm/astroLp/Table/Columns/AstroLpApy'
import MaxLTV, { LTV_MAX_META } from 'components/earn/farm/common/Table/Columns/MaxLTV'
import Deposit, { DEPOSIT_META } from 'components/hls/Farm/Table/Columns/Deposit'
import DepositCap, {
  DEPOSIT_CAP_META,
  depositCapSortingFn,
} from 'components/hls/Farm/Table/Columns/DepositCap'
import MaxLeverage, { MAX_LEV_META } from 'components/hls/Farm/Table/Columns/MaxLeverage'
import Name, { NAME_META } from 'components/hls/Farm/Table/Columns/Name'
import useAssets from 'hooks/assets/useAssets'

interface Props {
  isLoading: boolean
}

export default function useAvailableHlsFarmsColumns(props: Props) {
  const { data: assets } = useAssets()
  return useMemo<ColumnDef<HlsFarm>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name farm={row.original.farm as AstroLp} />,
      },
      {
        ...MAX_LEV_META,
        cell: ({ row }) => <MaxLeverage farm={row.original as HlsFarm} />,
      },
      {
        ...LTV_MAX_META,
        cell: ({ row }) => <MaxLTV vault={row.original.farm as AstroLp} />,
      },
      {
        ...DEPOSIT_CAP_META,
        cell: ({ row }) => <DepositCap farm={row.original} isLoading={props.isLoading} />,
        sortingFn: depositCapSortingFn,
      },
      {
        ...APY_META,
        cell: ({ row }) => <AstroLpApy astroLp={row.original.farm as AstroLp} assets={assets} />,
      },
      {
        ...DEPOSIT_META,
        cell: ({ row }) => <Deposit hlsFarm={row.original} />,
      },
    ]
  }, [props.isLoading, assets])
}
