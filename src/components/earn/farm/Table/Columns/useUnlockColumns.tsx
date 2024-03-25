import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Name, { NAME_META } from 'components/earn/farm/Table/Columns/Name'
import UnlockAmount, { UNLOCK_AMOUNT_META } from 'components/earn/farm/Table/Columns/UnlockAmount'
import UnlockTime, { UNLOCK_TIME_META } from 'components/earn/farm/Table/Columns/UnlockTime'
import UnlockValue, { UNLOCK_VALUE_META } from 'components/earn/farm/Table/Columns/UnlockValue'
import { Withdraw, WITHDRAW_META } from 'components/earn/farm/Table/Columns/Withdraw'

interface Props {
  showActions?: boolean
}
export default function useUnlockColumns(props: Props) {
  return useMemo<ColumnDef<DepositedVault>[]>(() => {
    return [
      {
        ...NAME_META,
        cell: ({ row }) => <Name vault={row.original as DepositedVault} />,
      },
      {
        ...UNLOCK_TIME_META,
        cell: ({ row }) => <UnlockTime unlocksAt={row.original.unlocksAt} />,
      },
      {
        ...UNLOCK_AMOUNT_META,
        cell: ({ row }) => <UnlockAmount vault={row.original as DepositedVault} />,
      },
      {
        ...UNLOCK_VALUE_META,
        cell: ({ row }) => <UnlockValue vault={row.original as DepositedVault} />,
      },
      ...(props.showActions
        ? [
            {
              ...WITHDRAW_META,
              cell: ({ row }: { row: any }) => <Withdraw vault={row.original as DepositedVault} />,
            },
          ]
        : []),
    ]
  }, [props.showActions])
}
