import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import CollateralizationRatio, {
  COLL_META,
} from 'components/earn/farm/common/Table/Columns/CollateralizationRatio'
import { NAME_META } from 'components/earn/farm/common/Table/Columns/Name'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import { PerpsName } from 'components/earn/farm/perps/Table/Columns/PerpsName'
import VaultManage, { MANAGE_META } from 'components/earn/farm/vault/Table/Columns/VaultManage'
import VaultPositionValue, {
  POSITION_VALUE_META,
} from 'components/earn/farm/vault/Table/Columns/VaultPositionValue'
import Apy, { APY_META } from 'components/earn/lend/Table/Columns/Apy'

export default function useActiveVaultsColumns() {
  return useMemo<ColumnDef<DepositedPerpsVault>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <PerpsName vault={row.original as DepositedPerpsVault} />,
      },
      {
        ...POSITION_VALUE_META,
        cell: ({ row }: { row: Row<DepositedPerpsVault> }) => (
          <VaultPositionValue vault={row.original as DepositedPerpsVault} />
        ),
      },
      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy isLoading={false} borrowEnabled={true} apy={row.original.apy ?? 0} />
        ),
      },
      {
        ...TVL_META,
        cell: ({ row }) => (
          <TVL
            denom={(row.original as DepositedPerpsVault).denom}
            amount={(row.original as DepositedPerpsVault).liquidity}
          />
        ),
      },

      {
        ...COLL_META,
        cell: ({ row }) => (
          <CollateralizationRatio
            amount={(row.original as DepositedPerpsVault).collateralizationRatio}
          />
        ),
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
