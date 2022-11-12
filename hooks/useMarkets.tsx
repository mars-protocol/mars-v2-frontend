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
          borrow_index: '1.009983590233269535',
          liquidity_index: '1.002073497939302451',
          borrow_rate: '0.350254719559196173',
          liquidity_rate: '0.039428374060840366',
          indexes_last_updated: 1668271634,
          collateral_total_scaled: '8275583285688290',
          debt_total_scaled: '1155363812346122',
          deposit_enabled: true,
          borrow_enabled: true,
          deposit_cap: '15000000000000',
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
          borrow_index: '1.015550607619308095',
          liquidity_index: '1.003284932040106733',
          borrow_rate: '0.75632500115230499',
          liquidity_rate: '0.435023016254423759',
          indexes_last_updated: 1668273756,
          collateral_total_scaled: '3309105730887721',
          debt_total_scaled: '2350429206911653',
          deposit_enabled: true,
          borrow_enabled: true,
          deposit_cap: '15000000000000',
        },
        'ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1': {
          denom: 'ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1',
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
          borrow_index: '1.001519837645865043',
          liquidity_index: '1',
          borrow_rate: '0.3',
          liquidity_rate: '0',
          indexes_last_updated: 1667995650,
          collateral_total_scaled: '1000000000000000',
          debt_total_scaled: '0',
          deposit_enabled: true,
          borrow_enabled: true,
          deposit_cap: '15000000000000',
        },
      },
    }),
    {
      staleTime: Infinity,
    },
  )

  return {
    ...result,
    data: useMemo(() => {
      return result?.data && result.data.wasm
    }, [result.data]),
  }
}

export default useMarkets
