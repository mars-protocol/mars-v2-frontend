import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/account/AccountBalancesTable/Columns/Apy'
import Size, { SIZE_META } from 'components/account/AccountStrategiesTable/Columns/Size'
import StrategyAndValue, {
  STRATEGY_AND_VALUE_META,
} from 'components/account/AccountStrategiesTable/Columns/StrategyAndValue'
import useMarkets from 'hooks/markets/useMarkets'

export default function useAccountStrategiesColumns(account: Account) {
  const markets = useMarkets()

  return useMemo<ColumnDef<AccountStrategyRow>[]>(() => {
    return [
      {
        ...STRATEGY_AND_VALUE_META,
        cell: ({ row }) => (
          <StrategyAndValue
            name={row.original.name}
            value={row.original.value}
            sizeChange={row.original.sizeChange}
          />
        ),
      },
      {
        ...SIZE_META,
        cell: ({ row }) => <Size size={row.original.size} sizeChange={row.original.sizeChange} />,
      },
      {
        ...APY_META,
        cell: ({ row }) => (
          <Apy apy={row.original.apy} markets={markets} denom={row.original.denom} type={'vault'} />
        ),
      },
    ]
  }, [markets])
}
