import { useCallback, useEffect, useMemo, useState } from 'react'

import usePrices from 'hooks/usePrices'
import useAssetParams from 'hooks/useAssetParams'
import {
  AssetParamsBaseForAddr,
  HealthComputer,
} from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'
import { VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'
import useVaultConfigs from 'hooks/useVaultConfigs'
import {
  BorrowTarget,
  compute_health_js,
  max_borrow_estimate_js,
  max_swap_estimate_js,
  max_withdraw_estimate_js,
  SwapKind,
} from 'utils/health_computer'
import { convertAccountToPositions } from 'utils/accounts'
import {
  Positions,
  VaultPositionValue,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import useStore from 'store'
import { BN_ZERO } from 'constants/math'
import { BN } from 'utils/helpers'

export default function useHealthComputer(account?: Account) {
  const { data: prices } = usePrices()
  const { data: assetParams } = useAssetParams()
  const { data: vaultConfigs } = useVaultConfigs()
  const baseCurrency = useStore((s) => s.baseCurrency)

  const [health, setHealth] = useState(0)
  const positions: Positions | null = useMemo(() => {
    if (!account) return null
    return convertAccountToPositions(account)
  }, [account])
  const baseCurrencyPrice = useMemo(
    () => prices.find((price) => price.denom === baseCurrency.denom)?.amount || 0,
    [prices, baseCurrency.denom],
  )

  const vaultPositionValues = useMemo(() => {
    if (!account?.vaults) return null
    return account.vaults.reduce(
      (prev, curr) => {
        const baseCoinPrice = prices.find((price) => price.denom === curr.denoms.lp)?.amount || 0
        prev[curr.address] = {
          base_coin: {
            amount: '0', // Not used by healthcomputer
            denom: curr.denoms.lp,
            value: curr.amounts.unlocking.times(baseCoinPrice).integerValue().toString(),
          },
          vault_coin: {
            amount: '0', // Not used by healthcomputer
            denom: curr.denoms.vault,
            value: curr.values.primary
              .div(baseCurrencyPrice)
              .plus(curr.values.secondary.div(baseCurrencyPrice))
              .integerValue()
              .toString(),
          },
        }
        return prev
      },
      {} as { [key: string]: VaultPositionValue },
    )
  }, [account?.vaults, prices, baseCurrencyPrice])

  const priceData = useMemo(() => {
    const baseCurrencyPrice =
      prices.find((price) => price.denom === baseCurrency.denom)?.amount || 0

    return prices.reduce(
      (prev, curr) => {
        prev[curr.denom] = curr.amount.div(baseCurrencyPrice).decimalPlaces(18).toString()
        return prev
      },
      {} as { [key: string]: string },
    )
  }, [prices, baseCurrency.denom])

  const denomsData = useMemo(
    () =>
      assetParams.reduce(
        (prev, curr) => {
          const params: AssetParamsBaseForAddr = {
            ...curr,
            // The following overrides are required as testnet is 'broken' and new contracts are not updated yet
            // These overrides are not used by the healthcomputer internally, so they're not important anyways.
            protocol_liquidation_fee: '1',
            liquidation_bonus: {
              max_lb: '1',
              min_lb: '1',
              slope: '1',
              starting_lb: '1',
            },
          }
          prev[params.denom] = params

          return prev
        },
        {} as { [key: string]: AssetParamsBaseForAddr },
      ),
    [assetParams],
  )

  const vaultConfigsData = useMemo(() => {
    if (!positions || !vaultConfigs.length) return null

    const vaultPositionDenoms = positions.vaults.map((vault) => vault.vault.address)
    return vaultConfigs
      .filter((config) => vaultPositionDenoms.includes(config.addr))
      .reduce(
        (prev, curr) => {
          prev[curr.addr] = curr
          return prev
        },
        {} as { [key: string]: VaultConfigBaseForString },
      )
  }, [vaultConfigs, positions])

  const healthComputer: HealthComputer | null = useMemo(() => {
    if (
      !positions ||
      !vaultPositionValues ||
      !vaultConfigsData ||
      Object.keys(denomsData).length === 0 ||
      Object.keys(priceData).length === 0 ||
      positions.vaults.length !== Object.keys(vaultPositionValues).length
    )
      return null

    return {
      denoms_data: { params: denomsData, prices: priceData },
      vaults_data: {
        vault_configs: vaultConfigsData,
        vault_values: vaultPositionValues,
      },
      positions: positions,
      kind: 'default',
    }
  }, [priceData, denomsData, vaultConfigsData, vaultPositionValues, positions])

  useEffect(() => {
    async function computeHealthWasm() {
      if (!healthComputer) return
      setHealth(Number((await compute_health_js(healthComputer)).max_ltv_health_factor) || 0)
    }
    computeHealthWasm()
  }, [healthComputer])

  const computeMaxBorrowAmount = useCallback(
    (denom: string, target: BorrowTarget) => {
      if (!healthComputer) return BN_ZERO
      return BN(max_borrow_estimate_js(healthComputer, denom, target))
    },
    [healthComputer],
  )

  const computeMaxWithdrawAmount = useCallback(
    (denom: string) => {
      if (!healthComputer) return BN_ZERO
      return BN(max_withdraw_estimate_js(healthComputer, denom))
    },
    [healthComputer],
  )

  const computeMaxSwapAmount = useCallback(
    (from: string, to: string, kind: SwapKind) => {
      if (!healthComputer) return BN_ZERO
      try {
        return BN(max_swap_estimate_js(healthComputer, from, to, kind))
      } catch {
        return BN_ZERO
      }
    },
    [healthComputer],
  )

  return { health, computeMaxBorrowAmount, computeMaxWithdrawAmount, computeMaxSwapAmount }
}
