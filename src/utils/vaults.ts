import { ASSETS } from 'constants/assets'
import { ENV } from 'constants/env'
import { BN_ZERO } from 'constants/math'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import { BNCoin } from 'types/classes/BNCoin'
import { NETWORK } from 'types/enums/network'
import { Action, Uint128 } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getAssetByDenom } from 'utils/assets'
import { VAULT_DEPOSIT_BUFFER } from 'utils/constants'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { getValueFromBNCoins, mergeBNCoinArrays } from 'utils/helpers'
import { getTokenPrice } from 'utils/tokens'

export function getVaultsMetaData() {
  return ENV.NETWORK === NETWORK.TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
}

export function getVaultMetaData(address: string) {
  const vaults = ENV.NETWORK === NETWORK.TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
  return vaults.find((vault) => vault.address === address)
}

export function getVaultDepositCoinsAndValue(
  vault: Vault,
  deposits: BNCoin[],
  borrowings: BNCoin[],
  reclaims: BNCoin[],
  prices: BNCoin[],
  slippage: number,
) {
  const depositsAndReclaims = mergeBNCoinArrays(deposits, reclaims)
  const borrowingsAndDepositsAndReclaims = mergeBNCoinArrays(borrowings, depositsAndReclaims)

  // The slippage is to account for rounding errors. Otherwise, it might happen we try to deposit more value
  // into the vaults than there are funds available.
  const totalValue = getValueFromBNCoins(borrowingsAndDepositsAndReclaims, prices).times(
    1 - slippage,
  )
  const halfValue = totalValue.dividedBy(2)

  const primaryAsset = getAssetByDenom(vault.denoms.primary) ?? ASSETS[0]
  const secondaryAsset = getAssetByDenom(vault.denoms.secondary) ?? ASSETS[0]

  // The buffer is needed as sometimes the pools are a bit skew, or because of other inaccuracies in the messages
  const primaryDepositAmount = halfValue
    .dividedBy(getTokenPrice(primaryAsset.denom, prices))
    .shiftedBy(primaryAsset.decimals)
    .times(VAULT_DEPOSIT_BUFFER)
    .integerValue()

  const secondaryDepositAmount = halfValue
    .dividedBy(getTokenPrice(secondaryAsset.denom, prices))
    .shiftedBy(secondaryAsset.decimals)
    .times(VAULT_DEPOSIT_BUFFER)
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

export function getVaultSwapActions(
  vault: Vault,
  deposits: BNCoin[],
  reclaims: BNCoin[],
  borrowings: BNCoin[],
  prices: BNCoin[],
  slippage: number,
): Action[] {
  const swapActions: Action[] = []
  const coins = [...deposits, ...borrowings, ...reclaims]

  const value = getValueFromBNCoins(coins, prices)

  let primaryLeftoverValue = value.dividedBy(2)
  let secondaryLeftoverValue = value.dividedBy(2)

  const [primaryCoins, secondaryCoins, otherCoins] = coins.reduce(
    (prev, bnCoin) => {
      switch (bnCoin.denom) {
        case vault.denoms.primary:
          prev[0].push(bnCoin)
          break
        case vault.denoms.secondary:
          prev[1].push(bnCoin)
          break
        default:
          prev[2].push(bnCoin)
      }
      return prev
    },
    [[], [], []] as [BNCoin[], BNCoin[], BNCoin[]],
  )

  primaryCoins.forEach((bnCoin) => {
    let value = getCoinValue(bnCoin, prices)
    if (value.isLessThanOrEqualTo(primaryLeftoverValue)) {
      primaryLeftoverValue = primaryLeftoverValue.minus(value)
    } else {
      value = value.minus(primaryLeftoverValue)
      primaryLeftoverValue = primaryLeftoverValue.minus(primaryLeftoverValue)
      otherCoins.push(
        BNCoin.fromDenomAndBigNumber(bnCoin.denom, getCoinAmount(bnCoin.denom, value, prices)),
      )
    }
  })

  secondaryCoins.forEach((bnCoin) => {
    let value = getCoinValue(bnCoin, prices)
    if (value.isLessThanOrEqualTo(secondaryLeftoverValue)) {
      secondaryLeftoverValue = secondaryLeftoverValue.minus(value)
    } else {
      value = value.minus(secondaryLeftoverValue)
      secondaryLeftoverValue = secondaryLeftoverValue.minus(secondaryLeftoverValue)
      otherCoins.push(
        BNCoin.fromDenomAndBigNumber(bnCoin.denom, getCoinAmount(bnCoin.denom, value, prices)),
      )
    }
  })

  otherCoins.forEach((bnCoin) => {
    let value = getCoinValue(bnCoin, prices)
    let amount = bnCoin.amount

    if (primaryLeftoverValue.isGreaterThan(0)) {
      const swapValue = value.isLessThan(primaryLeftoverValue) ? value : primaryLeftoverValue
      const swapAmount = getCoinAmount(bnCoin.denom, swapValue, prices)

      value = value.minus(swapValue)
      amount = amount.minus(swapAmount)
      primaryLeftoverValue = primaryLeftoverValue.minus(swapValue)
      if (swapAmount.isGreaterThan(BN_ZERO))
        swapActions.push(getSwapAction(bnCoin.denom, vault.denoms.primary, swapAmount, slippage))
    }

    if (secondaryLeftoverValue.isGreaterThan(0)) {
      secondaryLeftoverValue = secondaryLeftoverValue.minus(value)
      if (amount.isGreaterThan(BN_ZERO))
        swapActions.push(getSwapAction(bnCoin.denom, vault.denoms.secondary, amount, slippage))
    }
  })

  return swapActions
}

export function getEnterVaultActions(
  vault: Vault,
  primaryCoin: BNCoin,
  secondaryCoin: BNCoin,
  slippage: number,
): Action[] {
  primaryCoin.amount = primaryCoin.amount.times(0.8).integerValue()
  secondaryCoin.amount = secondaryCoin.amount.times(0.8).integerValue()

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

function getSwapAction(denomIn: string, denomOut: string, amount: BigNumber, slippage: number) {
  return {
    swap_exact_in: {
      coin_in: {
        denom: denomIn,
        amount: {
          exact: amount.toString(),
        },
      },
      denom_out: denomOut,
      slippage: slippage.toString(),
    },
  }
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
