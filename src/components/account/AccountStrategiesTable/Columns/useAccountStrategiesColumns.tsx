import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import Apy, { APY_META } from 'AccountBalancesTable/Columns/Apy'
import UnlockTime from 'earn/farm/common/Table/Columns/UnlockTime'
import useMarkets from 'hooks/markets/useMarkets'
import Size, { SIZE_META } from './Size'
import StrategyAndValue, { STRATEGY_AND_VALUE_META } from './StrategyAndValue'

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
