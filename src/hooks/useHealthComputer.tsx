import { useCallback, useEffect, useMemo, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import useAssetParams from 'hooks/useAssetParams'
import usePrices from 'hooks/usePrices'
import useVaultConfigs from 'hooks/useVaultConfigs'
import useStore from 'store'
import {
  Positions,
  VaultPositionValue,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'
import {
  AssetParamsBaseForAddr,
  HealthComputer,
} from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'
import { convertAccountToPositions } from 'utils/accounts'
import { LTV_BUFFER } from 'utils/constants'
import {
  BorrowTarget,
  compute_health_js,
  max_borrow_estimate_js,
  max_swap_estimate_js,
  max_withdraw_estimate_js,
  SwapKind,
} from 'utils/health_computer'
import { BN } from 'utils/helpers'

export default function useHealthComputer(account?: Account) {
  const { data: prices } = usePrices()
  const { data: assetParams } = useAssetParams()
  const { data: vaultConfigs } = useVaultConfigs()
  const baseCurrency = useStore((s) => s.baseCurrency)

  const [healthFactor, setHealthFactor] = useState(0)
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
          prev[curr.denom] = curr

          return prev
        },
        {} as { [key: string]: AssetParamsBaseForAddr },
      ),
    [assetParams],
  )

  const vaultConfigsData = useMemo(() => {
    if (!vaultConfigs.length) return null

    return vaultConfigs.reduce(
      (prev, curr) => {
        prev[curr.addr] = curr
        return prev
      },
      {} as { [key: string]: VaultConfigBaseForString },
    )
  }, [vaultConfigs])

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
    if (!healthComputer) return
    try {
      setHealthFactor(Number(compute_health_js(healthComputer).max_ltv_health_factor) || 10)
    } catch (err) {
      console.error(err)
    }
  }, [healthComputer])

  const computeMaxBorrowAmount = useCallback(
    (denom: string, target: BorrowTarget) => {
      if (!healthComputer) return BN_ZERO
      try {
        return BN(max_borrow_estimate_js(healthComputer, denom, target))
          .multipliedBy(1 - LTV_BUFFER)
          .integerValue()
      } catch (err) {
        console.error(err)
        return BN_ZERO
      }
    },
    [healthComputer],
  )

  const computeMaxWithdrawAmount = useCallback(
    (denom: string) => {
      if (!healthComputer) return BN_ZERO
      try {
        return BN(max_withdraw_estimate_js(healthComputer, denom))
      } catch (err) {
        console.error(err)
        return BN_ZERO
      }
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

  const health = useMemo(() => {
    if (healthFactor > 10) return 100
    if (healthFactor < 0) return 0
    return BN(healthFactor * 10)
      .integerValue()
      .toNumber()
  }, [healthFactor])

  return {
    health,
    healthFactor,
    computeMaxBorrowAmount,
    computeMaxWithdrawAmount,
    computeMaxSwapAmount,
  }
}