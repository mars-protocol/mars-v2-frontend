import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface Market {
  denom: string
  max_loan_to_value: string
  liquidation_threshold: string
  liquidation_bonus: string
  reserve_factor: string
  interest_rate_model: {
    optimal_utilization_rate: string
    base: string
    slope_1: string
    slope_2: string
  }
  borrow_index: string
  liquidity_index: string
  borrow_rate: string
  liquidity_rate: string
  indexes_last_updated: number
  collateral_total_scaled: string
  debt_total_scaled: string
  deposit_enabled: boolean
  borrow_enabled: boolean
  deposit_cap: string
}

interface Result {
  wasm: {
    [key: string]: Market
  }
}

const useMarkets = () => {
  const result = useQuery<Result>(
    ['marketInfo'],
    () => ({
      wasm: {
        uosmo: {
          denom: 'uosmo',
          max_loan_to_value: '0.55',
          liquidation_threshold: '0.65',
          liquidation_bonus: '0.1',
          reserve_factor: '0.2',
          interest_rate_model: {
            optimal_utilization_rate: '0.7',
            base: '0.3',
            slope_1: '0.25',
            slope_2: '0.3',
          },
          borrow_index: '1.002171957411401332',
          liquidity_index: '1.00055035491698614',
          borrow_rate: '0.1',
          liquidity_rate: '0',
          indexes_last_updated: 1664544343,
          collateral_total_scaled: '89947659146708',
          debt_total_scaled: '0',
          deposit_enabled: true,
          borrow_enabled: true,
          deposit_cap: '1000000000000',
        },
        'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': {
          denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
          max_loan_to_value: '0.65',
          liquidation_threshold: '0.7',
          liquidation_bonus: '0.1',
          reserve_factor: '0.2',
          interest_rate_model: {
            optimal_utilization_rate: '0.1',
            base: '0.3',
            slope_1: '0.25',
            slope_2: '0.3',
          },
          borrow_index: '1.000000224611044228',
          liquidity_index: '1.000000023465246067',
          borrow_rate: '0.25',
          liquidity_rate: '0',
          indexes_last_updated: 1664367327,
          collateral_total_scaled: '0',
          debt_total_scaled: '0',
          deposit_enabled: true,
          borrow_enabled: true,
          deposit_cap: '1000000000',
        },
      },
    }),
    {
      staleTime: Infinity,
    }
  )

  return {
    ...result,
    data: useMemo(() => {
      return result?.data && result.data.wasm
    }, [result.data]),
  }
}

export default useMarkets
