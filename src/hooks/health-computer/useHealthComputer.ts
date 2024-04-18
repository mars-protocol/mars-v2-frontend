import { useCallback, useEffect, useMemo, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useAllAssets from 'hooks/assets/useAllAssets'
import useAssetParams from 'hooks/params/useAssetParams'
import useAllPerpsDenomStates from 'hooks/perps/usePerpsDenomStates'
import { useAllPerpsParamsSC } from 'hooks/perps/usePerpsParams'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import usePrices from 'hooks/prices/usePrices'
import useSlippage from 'hooks/settings/useSlippage'
import useVaultConfigs from 'hooks/vaults/useVaultConfigs'
import { VaultPositionValue } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { PerpParams, VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'
import { PerpDenomState } from 'types/generated/mars-perps/MarsPerps.types'
import {
  AssetParamsBaseForAddr,
  HealthComputer,
  Positions,
} from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'
import { convertAccountToPositions } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import {
  BorrowTarget,
  LiquidationPriceKind,
  SwapKind,
  compute_health_js,
  liquidation_price_js,
  max_borrow_estimate_js,
  max_perp_size_estimate_js,
  max_swap_estimate_js,
  max_withdraw_estimate_js,
} from 'utils/health_computer'
import { BN } from 'utils/helpers'

// Pyth returns prices with up to 32 decimals. Javascript only supports 18 decimals. So we need to scale by 14 t
// avoid "too many decimals" errors.
// TODO: Remove adjustment properly (after testing). We will just ignore the last 14 decimals.
const VALUE_SCALE_FACTOR = 12

export default function useHealthComputer(account?: Account) {
  const assets = useAllAssets()
  const { data: prices } = usePrices()
  const { data: assetParams } = useAssetParams()
  const { data: vaultConfigs } = useVaultConfigs()
  const { data: perpsDenomStates } = useAllPerpsDenomStates()
  const { data: perpsParams } = useAllPerpsParamsSC()
  const { data: perpsVault } = usePerpsVault()
  const [slippage] = useSlippage()

  const [healthFactor, setHealthFactor] = useState(0)
  const positions: Positions | null = useMemo(() => {
    if (!account) return null
    return convertAccountToPositions(account)
  }, [account])

  const vaultPositionValues = useMemo(() => {
    if (!account?.vaults) return null
    return account.vaults.reduce(
      (prev, curr) => {
        const baseCoinPrice = prices.find((price) => price.denom === curr.denoms.lp)?.amount || 0
        prev[curr.address] = {
          base_coin: {
            amount: '0', // Not used by healthcomputer
            denom: curr.denoms.lp,
            value: curr.amounts.unlocking
              .plus(curr.amounts.unlocked)
              .times(baseCoinPrice)
              .integerValue()
              .toString(),
          },
          vault_coin: {
            amount: '0', // Not used by healthcomputer
            denom: curr.denoms.vault,
            value: curr.values.primary
              .plus(curr.values.secondary)
              .shiftedBy(VALUE_SCALE_FACTOR + 6) // Need to scale additional 6 to correct for uusd values
              .integerValue()
              .toString(),
          },
        }
        return prev
      },
      {} as { [key: string]: VaultPositionValue },
    )
  }, [account?.vaults, prices])

  const priceData = useMemo(() => {
    return prices.reduce(
      (prev, curr) => {
        const decimals = assets.find(byDenom(curr.denom))?.decimals || 6

        // The HealthComputer needs prices expressed per 1 amount. So we need to correct here for any additional decimals.
        prev[curr.denom] = curr.amount
          .shiftedBy(VALUE_SCALE_FACTOR)
          .shiftedBy(-decimals + 6)
          .decimalPlaces(18)
          .toString()
        return prev
      },
      {} as { [key: string]: string },
    )
  }, [assets, prices])

  const denomsData = useMemo(
    () =>
      assetParams.reduce(
        (prev, curr) => {
          prev[curr.denom] = curr
          if (!curr.close_factor) {
            prev[curr.denom].close_factor = '0'
          }

          return prev
        },
        {} as { [key: string]: AssetParamsBaseForAddr },
      ),
    [assetParams],
  )

  const vaultConfigsData = useMemo(() => {
    if (!vaultConfigs.length) return {}

    return vaultConfigs.reduce(
      (prev, curr) => {
        prev[curr.addr] = curr
        return prev
      },
      {} as { [key: string]: VaultConfigBaseForString },
    )
  }, [vaultConfigs])

  const perpsParamsData = useMemo(() => {
    if (!perpsParams) return {}
    return perpsParams.reduce(
      (prev, curr) => {
        prev[curr.denom] = curr

        return prev
      },
      {} as { [key: string]: PerpParams },
    )
  }, [perpsParams])

  const denomStates = useMemo(() => {
    let denomStates: { [key: string]: PerpDenomState } = {}
    if (!perpsDenomStates) return denomStates

    for (let denomState of perpsDenomStates) {
      denomStates[denomState.denom] = denomState
    }
    return denomStates
  }, [perpsDenomStates])

  const healthComputer: HealthComputer | null = useMemo(() => {
    if (
      !account ||
      !positions ||
      !vaultPositionValues ||
      !vaultConfigsData ||
      !denomStates ||
      !perpsParamsData ||
      Object.keys(denomsData).length === 0 ||
      Object.keys(priceData).length === 0 ||
      positions.vaults.length !== Object.keys(vaultPositionValues).length
    )
      return null

    return {
      kind: account.kind,
      vaults_data: {
        vault_configs: vaultConfigsData,
        vault_values: vaultPositionValues,
      },
      asset_params: denomsData,
      oracle_prices: priceData,
      positions: positions,
      perps_data: {
        denom_states: denomStates,
        params: perpsParamsData,
      },
    } as HealthComputer
  }, [
    account,
    positions,
    vaultPositionValues,
    vaultConfigsData,
    perpsParamsData,
    denomsData,
    priceData,
    denomStates,
  ])

  useEffect(() => {
    if (!healthComputer) return
    try {
      setHealthFactor(Number(compute_health_js(healthComputer).max_ltv_health_factor) || 10)
    } catch (err) {
      console.error('Failed to calculate health: ', err)
    }
  }, [healthComputer])

  const computeMaxBorrowAmount = useCallback(
    (denom: string, target: BorrowTarget) => {
      if (!healthComputer) return BN_ZERO
      try {
        return BN(max_borrow_estimate_js(healthComputer, denom, target)).integerValue()
      } catch (err) {
        console.error('Failed to calculate max borrow amount: ', err)
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
        console.error('Failed to calculate max withdraw amount: ', err)
        return BN_ZERO
      }
    },
    [healthComputer],
  )

  const computeMaxSwapAmount = useCallback(
    (from: string, to: string, kind: SwapKind) => {
      if (!healthComputer) return BN_ZERO
      try {
        return BN(
          max_swap_estimate_js(
            healthComputer,
            from,
            to,
            kind,
            BN(slippage).plus(SWAP_FEE_BUFFER).toString(),
          ),
        )
      } catch (err) {
        console.error('Failed to calculate max swap amount: ', err)
        return BN_ZERO
      }
    },
    [healthComputer, slippage],
  )

  const computeLiquidationPrice = useCallback(
    (denom: string, kind: LiquidationPriceKind) => {
      if (!healthComputer) return null
      try {
        const asset = assets.find(byDenom(denom))
        if (!asset) return null
        const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS
        return BN(liquidation_price_js(healthComputer, denom, kind))
          .shiftedBy(-VALUE_SCALE_FACTOR)
          .shiftedBy(decimalDiff)
          .toNumber()
      } catch (err) {
        console.error('Failed to calculate liquidation price: ', err)
        return null
      }
    },
    [assets, healthComputer],
  )

  const computeMaxPerpAmount = useCallback(
    (denom: string, tradeDirection: TradeDirection) => {
      if (!healthComputer || !perpsVault || !denomStates) return BN_ZERO
      try {
        return BN(
          max_perp_size_estimate_js(
            healthComputer,
            denom,
            perpsVault.denom,
            denomStates[denom].long_oi.toString(),
            denomStates[denom].short_oi.toString(),
            tradeDirection,
          ),
        ).abs()
      } catch (err) {
        console.error('Failed to calculate max perp size: ', err)
        return BN_ZERO
      }
    },
    [healthComputer, perpsVault, denomStates],
  )

  const health = useMemo(() => {
    const slope = account?.kind === 'high_levered_strategy' ? 1.2 : 3.5
    const convertedHealth = BN(Math.log(healthFactor))
      .dividedBy(Math.log(slope))
      .multipliedBy(100)
      .integerValue()
      .toNumber()

    if (convertedHealth > 100) return 100
    if (convertedHealth === 0 && healthFactor > 1) return 1
    if (convertedHealth < 0) return 0
    return convertedHealth
  }, [healthFactor, account?.kind])

  return {
    health,
    healthFactor,
    computeMaxBorrowAmount,
    computeMaxWithdrawAmount,
    computeMaxSwapAmount,
    computeLiquidationPrice,
    computeMaxPerpAmount,
  }
}
