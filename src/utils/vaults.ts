import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Action, Uint128 } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'
import { BN, getValueFromBNCoins, mergeBNCoinArrays } from 'utils/helpers'
import { getTokenPrice } from 'utils/tokens'

export function getVaultBaseDepositCoinsAndValue(
  vault: Vault,
  deposits: BNCoin[],
  borrowings: BNCoin[],
  reclaims: BNCoin[],
  slippage: number,
  assets: Asset[],
) {
  let primaryDepositValue = BN_ZERO
  let secondaryDepositValue = BN_ZERO
  const depositsAndReclaims = mergeBNCoinArrays(deposits, reclaims)
  const borrowingsAndDepositsAndReclaims = mergeBNCoinArrays(borrowings, depositsAndReclaims)

  // The slippage is to account for rounding errors. Otherwise, it might happen we try to deposit more value
  // into the vaults than there are funds available.
  const totalValue = getValueFromBNCoins(borrowingsAndDepositsAndReclaims, assets).times(
    1 - slippage,
  )

  const primaryAsset = assets.find(byDenom(vault.denoms.primary)) ?? assets[0]
  const secondaryAsset = assets.find(byDenom(vault.denoms.secondary)) ?? assets[0]

  const primaryAssetAmount =
    borrowingsAndDepositsAndReclaims.find(byDenom(primaryAsset.denom))?.amount ?? BN_ZERO
  const primaryAssetValue = getCoinValue(
    BNCoin.fromDenomAndBigNumber(vault.denoms.primary, primaryAssetAmount),
    assets,
  )
  const secondaryAssetAmount =
    borrowingsAndDepositsAndReclaims.find(byDenom(secondaryAsset.denom))?.amount ?? BN_ZERO
  const secondaryAssetValue = getCoinValue(
    BNCoin.fromDenomAndBigNumber(vault.denoms.secondary, secondaryAssetAmount),
    assets,
  )

  const depositAndReclaimsValue = getValueFromBNCoins(depositsAndReclaims, assets)

  if (totalValue.isZero())
    return {
      primaryCoin: new BNCoin({
        denom: vault.denoms.primary,
        amount: '0',
      }),
      secondaryCoin: new BNCoin({
        denom: vault.denoms.secondary,
        amount: '0',
      }),
      totalValue: totalValue,
    }
  // only use the halfValue of the depositsAndReclaims to calculate the base deposit amount
  const halfValue = depositAndReclaimsValue.dividedBy(2)

  // get the ratio by dividing the totals of the primary and secondary assets
  const ratio = primaryAssetValue.dividedBy(secondaryAssetValue)

  // a custom ratio is given if the ratio is bigger than the buffer + slippage or smaller than the buffer - slippage
  const isCustomRatio =
    primaryAssetValue.isZero() || secondaryAssetValue.isZero()
      ? true
      : ratio.isLessThan(BN(0.999).minus(slippage)) || ratio.isGreaterThan(BN(0.999).plus(slippage))

  if (isCustomRatio) {
    // on a custom ratio the value of the asset with the highe value has to deducted by the value of the asset with the lower value
    // this value is then divided by 2 to get the leftover value that will be swapped to the asset with the lower value

    // e.g.: $250 ATOM (primary) and $500 stATOM (secondary) -> $750 totalValue, $375 halfValue
    // return $250 ATOM and $375 stATOM as depositAmounts, since the swapFunction will return $125 worth of ATOM to add to the depositAmounts
    const hasMorePrimaryAsset = primaryAssetValue.isGreaterThan(secondaryAssetValue)

    primaryDepositValue = hasMorePrimaryAsset ? halfValue : primaryAssetValue
    secondaryDepositValue = hasMorePrimaryAsset ? secondaryAssetValue : halfValue
  } else {
    primaryDepositValue = halfValue
    secondaryDepositValue = halfValue
  }

  const primaryDepositAmount = primaryDepositValue
    .dividedBy(getTokenPrice(primaryAsset.denom, assets))
    .shiftedBy(primaryAsset.decimals)
    .integerValue()

  const secondaryDepositAmount = secondaryDepositValue
    .dividedBy(getTokenPrice(secondaryAsset.denom, assets))
    .shiftedBy(secondaryAsset.decimals)
    .integerValue()

  return {
    primaryCoin: new BNCoin({
      denom: vault.denoms.primary,
      amount: primaryDepositAmount.toString(),
    }),
    secondaryCoin: new BNCoin({
      denom: vault.denoms.secondary,
      amount: secondaryDepositAmount.toString(),
    }),
    totalValue: totalValue,
  }
}

export function getEnterVaultActions(
  vault: Vault,
  primaryCoin: BNCoin,
  secondaryCoin: BNCoin,
  slippage: number,
): Action[] {
  return [
    {
      provide_liquidity: {
        // Smart Contact demands that secondary coin is first
        coins_in: [secondaryCoin.toActionCoin(), primaryCoin.toActionCoin()],
        lp_token_out: vault.denoms.lp,
        slippage: slippage.toString(),
      },
    },
    {
      enter_vault: {
        coin: {
          denom: vault.denoms.lp,
          amount: 'account_balance',
        },
        vault: {
          address: vault.address,
        },
      },
    },
  ]
}

export function getVaultDepositCoinsFromActions(actions: Action[]) {
  const provideLiquidityAction = actions.find((action) =>
    Object.keys(action).includes('provide_liquidity'),
  ) as ProvideLiquidityAction | undefined

  if (!provideLiquidityAction) return []

  const actionsCoins = provideLiquidityAction.provide_liquidity.coins_in

  return actionsCoins.map((actionCoin) => {
    return new BNCoin({
      denom: actionCoin.denom,
      amount: (actionCoin.amount as { exact: Uint128 }).exact,
    })
  })
}

export function getVaultNameByCoins(chainConfig: ChainConfig, coins: Coin[]) {
  const vaults = chainConfig.vaults
  if (!vaults.length || coins.length !== 2) return
  const coinDenoms = coins.map((coin) => coin.denom)

  return vaults.find((vault) =>
    [vault.denoms.primary, vault.denoms.secondary].every((denom) => coinDenoms.includes(denom)),
  )?.name
}
