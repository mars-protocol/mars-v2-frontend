import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useAssets from 'hooks/assets/useAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAssetParams from 'hooks/params/useAssetParams'
import useAllPerpsMarketStates from 'hooks/perps/usePerpsMarketStates'
import { useAllPerpsParamsSC } from 'hooks/perps/usePerpsParams'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useSlippage from 'hooks/settings/useSlippage'
import useVaultConfigs from 'hooks/vaults/useVaultConfigs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultPositionValue } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'
import { MarketStateResponse } from 'types/generated/mars-perps/MarsPerps.types'
import {
  AssetParamsBaseForAddr,
  HealthComputer,
  PerpParams,
  Positions,
} from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'
import { convertAccountToPositions } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import {
  BorrowTarget,
  compute_health_js,
  liquidation_price_js,
  LiquidationPriceKind,
  max_borrow_estimate_js,
  max_perp_size_estimate_js,
  max_swap_estimate_js,
  max_withdraw_estimate_js,
  SwapKind,
} from 'utils/health_computer'
import { findPositionInAccount } from 'utils/healthComputer'
import { BN } from 'utils/helpers'
import { getTokenPrice } from 'utils/tokens'

// Pyth returns prices with up to 32 decimals. Javascript only supports 18 decimals. So we need to scale by 14 t
// avoid "too many decimals" errors.
// TODO: Remove adjustment properly (after testing). We will just ignore the last 14 decimals.
export const VALUE_SCALE_FACTOR = 12

export default function useHealthComputer(account?: Account) {
  const { data: assets } = useAssets()
  const whitelistedAssets = useWhitelistedAssets()
  const perpsAsssets = usePerpsEnabledAssets()
  const { data: assetParams } = useAssetParams()
  const { data: perpsMarketStates } = useAllPerpsMarketStates()
  const { data: perpsParams } = useAllPerpsParamsSC()
  const { data: vaultConfigs } = useVaultConfigs()
  const { data: perpsVault } = usePerpsVault()
  const [slippage] = useSlippage()

  const [healthFactor, setHealthFactor] = useState(0)
  const positions: Positions | null = useMemo(() => {
    if (!account) return null
    return convertAccountToPositions(account, assets)
  }, [account, assets])

  const vaultPositionValues = useMemo(() => {
    if (!account?.vaults) return null
    return account.vaults.reduce(
      (prev, curr) => {
        const baseCoinPrice = getTokenPrice(curr.denoms.lp, assets)
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
  }, [account?.vaults, assets])

  const priceData = useMemo(() => {
    const allAssets = [...whitelistedAssets, ...perpsAsssets]
    const assetsWithPrice = allAssets.filter((asset) => asset.price)
    const prices = assetsWithPrice.map((asset) => asset.price) as BNCoin[]
    return prices.reduce(
      (prev, curr) => {
        const decimals = assets.find(byDenom(curr.denom))?.decimals || PRICE_ORACLE_DECIMALS
        const decimalDiffrence = decimals - PRICE_ORACLE_DECIMALS

        // The HealthComputer needs prices expressed per 1 amount. So we need to correct here for any additional decimals.
        prev[curr.denom] = curr.amount
          .shiftedBy(VALUE_SCALE_FACTOR - decimalDiffrence)
          .decimalPlaces(18)
          .toString()
        return prev
      },
      {} as { [key: string]: string },
    )
  }, [assets, perpsAsssets, whitelistedAssets])

  const assetsParams = useMemo(
    () =>
      assetParams.reduce(
        (prev, curr) => {
          // Close factor is not important for any HC calculation
          prev[curr.denom] = { ...curr, close_factor: '0.9' }
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
        prev[curr.denom] = {
          ...curr,
          max_long_oi_value: BN(curr.max_long_oi_value).shiftedBy(VALUE_SCALE_FACTOR).toString(),
          max_short_oi_value: BN(curr.max_short_oi_value).shiftedBy(VALUE_SCALE_FACTOR).toString(),
          max_net_oi_value: BN(curr.max_net_oi_value).shiftedBy(VALUE_SCALE_FACTOR).toString(),
        }

        return prev
      },
      {} as { [key: string]: PerpParams },
    )
  }, [perpsParams])

  const marketStates = useMemo(() => {
    const marketStates: { [key: string]: MarketStateResponse } = {}

    if (!perpsMarketStates) return marketStates

    for (const marketState of perpsMarketStates) {
      marketStates[marketState.denom] = marketState
    }
    return marketStates
  }, [perpsMarketStates])

  const healthComputer: HealthComputer | null = useMemo(() => {
    if (
      !account ||
      !positions ||
      !vaultPositionValues ||
      !vaultConfigsData ||
      !marketStates ||
      !perpsParamsData ||
      Object.keys(assetsParams).length === 0 ||
      Object.keys(priceData).length === 0 ||
      positions.vaults.length !== Object.keys(vaultPositionValues).length
    )
      return null

    return {
      kind: account.kind,
      asset_params: assetsParams,
      oracle_prices: priceData,
      vaults_data: {
        vault_configs: vaultConfigsData,
        vault_values: vaultPositionValues,
      },
      positions,
      perps_data: {
        params: perpsParamsData,
      },
    } as HealthComputer
  }, [
    account,
    positions,
    vaultPositionValues,
    vaultConfigsData,
    perpsParamsData,
    marketStates,
    assetsParams,
    priceData,
  ])

  useEffect(() => {
    if (!healthComputer) return
    try {
      setHealthFactor(Number(compute_health_js(healthComputer).liquidation_health_factor) || 10)
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
    (from: string, to: string, kind: SwapKind, isRepayDebt: boolean) => {
      if (!healthComputer) return BN_ZERO
      try {
        return BN(
          max_swap_estimate_js(
            healthComputer,
            from,
            to,
            kind,
            BN(slippage).plus(SWAP_FEE_BUFFER).toString(),
            isRepayDebt,
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
        const asset = whitelistedAssets.find(byDenom(denom))
        const assetInAccount = findPositionInAccount(healthComputer, denom)
        if (!asset || !assetInAccount) return 0
        const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS
        return BN(liquidation_price_js(healthComputer, denom, kind))
          .shiftedBy(-VALUE_SCALE_FACTOR)
          .shiftedBy(decimalDiff)
          .toNumber()
      } catch (err) {
        console.error(
          'Failed to calculate liquidation price: ',
          err,
          'denom:',
          denom,
          'kind:',
          kind,
        )
        return null
      }
    },
    [healthComputer, whitelistedAssets],
  )

  const computeMaxPerpAmount = useCallback(
    (denom: string, tradeDirection: TradeDirection) => {
      if (!healthComputer || !perpsVault || !marketStates) return BN_ZERO
      try {
        const result = BN(
          max_perp_size_estimate_js(
            healthComputer,
            denom,
            perpsVault.denom,
            marketStates[denom].long_oi.toString(),
            marketStates[denom].short_oi.toString(),
            tradeDirection,
          ),
        ).abs()
        return result
      } catch (err) {
        console.error('Failed to calculate max perp size: ', err)
        return BN_ZERO
      }
    },
    [healthComputer, perpsVault, marketStates],
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
