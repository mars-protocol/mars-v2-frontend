import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'components/account/AccountBalancesTable/Columns/Apy'
import Size, { SIZE_META } from 'components/account/AccountStrategiesTable/Columns/Size'
import StrategyAndValue, {
  STRATEGY_AND_VALUE_META,
} from 'components/account/AccountStrategiesTable/Columns/StrategyAndValue'
import UnlockTime from 'components/earn/farm/Table/Columns/UnlockTime'
import useMarkets from 'hooks/markets/useMarkets'

export default function useAccountStrategiesColumns() {
  const markets = useMarkets()

  return useMemo<ColumnDef<AccountStrategyRow>[]>(() => {
    return [
      {
        ...STRATEGY_AND_VALUE_META,
        cell: ({ row }) => (
          <StrategyAndValue
            name={row.original.name}
            value={row.original.value}
            coinsChange={row.original.coinsChange}
          />
        ),
      },
      {
        ...SIZE_META,
        cell: ({ row }) => (
          <Size coins={row.original.coins} coinsChange={row.original.coinsChange} />
        ),
      },
      {
        ...APY_META,
        cell: ({ row }) => {
          if (row.original.unlocksAt !== undefined) {
            return <UnlockTime unlocksAt={row.original.unlocksAt} />
          }

          return (
            <Apy
              apy={row.original.apy}
              markets={markets}
              denom={row.original.denom}
              type={'vault'}
            />
          )
        },
      },
    ]
  }, [markets])
}
