import { ASSETS } from 'constants/assets'
import { IS_TESTNET } from 'constants/env'
import { BN_ZERO } from 'constants/math'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getAssetByDenom } from 'utils/assets'
import { getCoinValue } from 'utils/formatters'
import { getValueFromBNCoins, mergeBNCoinArrays } from 'utils/helpers'
import { getTokenPrice } from 'utils/tokens'

export function getVaultsMetaData() {
  return IS_TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
}

export function getVaultMetaData(address: string) {
  const vaults = IS_TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
  return vaults.find((vault) => vault.address === address)
}

export function getVaultDepositCoinsAndValue(
  vault: Vault,
  deposits: BNCoin[],
  borrowings: BNCoin[],
  reclaims: BNCoin[],
  prices: BNCoin[],
) {
  const depositsAndReclaims = mergeBNCoinArrays(deposits, reclaims)
  const borrowingsAndDepositsAndReclaims = mergeBNCoinArrays(borrowings, depositsAndReclaims)
  const totalValue = getValueFromBNCoins(borrowingsAndDepositsAndReclaims, prices)
  const halfValue = totalValue.dividedBy(2)

  const primaryAsset = getAssetByDenom(vault.denoms.primary) ?? ASSETS[0]
  const secondaryAsset = getAssetByDenom(vault.denoms.secondary) ?? ASSETS[0]

  const primaryDepositAmount = halfValue
    .dividedBy(getTokenPrice(primaryAsset.denom, prices))
    .shiftedBy(primaryAsset.decimals)
    .integerValue()

  const secondaryDepositAmount = halfValue
    .dividedBy(getTokenPrice(secondaryAsset.denom, prices))
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

export function getVaultSwapActions(
  vault: Vault,
  deposits: BNCoin[],
  borrowings: BNCoin[],
  prices: BNCoin[],
  slippage: number,
  totalValue: BigNumber,
): Action[] {
  const swapActions: Action[] = []
  const coins = [...deposits, ...borrowings]

  let primaryLeftoverValue = totalValue.dividedBy(2).integerValue()
  let secondaryLeftoverValue = totalValue.dividedBy(2).integerValue()

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
      otherCoins.push(new BNCoin({ denom: bnCoin.denom, amount: value.toString() }))
    }
  })

  secondaryCoins.forEach((bnCoin) => {
    let value = getCoinValue(bnCoin, prices)
    if (value.isLessThanOrEqualTo(secondaryLeftoverValue)) {
      secondaryLeftoverValue = secondaryLeftoverValue.minus(value)
    } else {
      value = value.minus(secondaryLeftoverValue)
      secondaryLeftoverValue = secondaryLeftoverValue.minus(secondaryLeftoverValue)
      otherCoins.push(new BNCoin({ denom: bnCoin.denom, amount: value.toString() }))
    }
  })

  otherCoins.forEach((bnCoin) => {
    let value = getCoinValue(bnCoin, prices)
    let amount = bnCoin.amount

    if (primaryLeftoverValue.isGreaterThan(0)) {
      const swapValue = value.isLessThan(primaryLeftoverValue) ? value : primaryLeftoverValue
      const swapAmount = swapValue
        .dividedBy(prices.find((coin) => coin.denom === bnCoin.denom)?.amount || 1)
        .integerValue()
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
  minLpToReceive: BigNumber,
): Action[] {
  return [
    {
      provide_liquidity: {
        // Smart Contact demands that secondary coin is first
        coins_in: [secondaryCoin.toActionCoin(), primaryCoin.toActionCoin()],
        lp_token_out: vault.denoms.lp,
        minimum_receive: minLpToReceive.toString(),
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