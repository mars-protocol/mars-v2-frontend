import { useCallback, useMemo } from 'react'

import usePrices from 'hooks/usePrices'
import useAssetParams from 'hooks/useAssetParams'
import {
  AssetParamsBaseForAddr,
  HealthComputer,
} from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'
import { VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'
import useVaultConfigs from 'hooks/useVaultConfigs'
import {
  compute_health_js,
  max_borrow_estimate_js,
  max_withdraw_estimate_js,
} from 'utils/health_computer'
import { convertAccountToPositions } from 'utils/accounts'
import { VaultPositionValue } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default function useHealthComputer(account: Account) {
  const { data: prices } = usePrices()
  const { data: assetParams } = useAssetParams()
  const { data: vaultConfigs } = useVaultConfigs()

  const positions = useMemo(() => convertAccountToPositions(account), [account])

  const vaultPositionValues = useMemo(
    () =>
      account.vaults.reduce((prev, curr) => {
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
            value: curr.values.primary.plus(curr.values.secondary).integerValue().toString(),
          },
        }
        return prev
      }, {} as { [key: string]: VaultPositionValue }),
    [account.vaults, prices],
  )

  const priceData = useMemo(
    () =>
      prices.reduce((prev, curr) => {
        prev[curr.denom] = curr.amount
        return prev
      }, {} as { [key: string]: string }),
    [prices],
  )

  const denomsData = useMemo(
    () =>
      assetParams.reduce((prev, curr) => {
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
      }, {} as { [key: string]: AssetParamsBaseForAddr }),
    [assetParams],
  )

  const vaultConfigsData = useMemo(() => {
    if (!positions || !vaultConfigs.length) return null

    const vaultPositionDenoms = positions.vaults.map((vault) => vault.vault.address)
    return vaultConfigs
      .filter((config) => vaultPositionDenoms.includes(config.addr))
      .reduce((prev, curr) => {
        prev[curr.addr] = curr
        return prev
      }, {} as { [key: string]: VaultConfigBaseForString })
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

  const computeHealth = useCallback(() => {
    async function callComputeHealthWasmFn(): Promise<number> {
      if (!healthComputer) return 0
      return Number((await compute_health_js(healthComputer)).max_ltv_health_factor) || 0
    }

    return callComputeHealthWasmFn()
  }, [healthComputer])

  const computeMaxBorrowAmount = useCallback(
    (denom: string) => {
      async function callMaxBorrowWasmFn(denom: string): Promise<number> {
        if (!healthComputer) return 0
        return await max_borrow_estimate_js(healthComputer, denom)
      }

      return callMaxBorrowWasmFn(denom)
    },
    [healthComputer],
  )

  const computeMaxWithdrawAmount = useCallback(
    (denom: string) => {
      async function callMaxWithdrawWasmFn(denom: string): Promise<number> {
        if (!healthComputer) return 0
        return await max_withdraw_estimate_js(healthComputer, denom)
      }

      return callMaxWithdrawWasmFn(denom)
    },
    [healthComputer],
  )

  return { computeHealth, computeMaxBorrowAmount, computeMaxWithdrawAmount }
}
