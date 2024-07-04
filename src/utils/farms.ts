import { BN_ZERO } from 'constants/math'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import { BNCoin } from 'types/classes/BNCoin'
import { Action, Uint128 } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import {
  AssetParamsBaseForAddr,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { byDenom } from 'utils/array'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { BN, getValueFromBNCoins, mergeBNCoinArrays } from 'utils/helpers'
import { convertApyToApr } from 'utils/parsers'
import { getTokenPrice } from 'utils/tokens'

export function getFarmFromPoolAsset(
  asset: Asset,
  chainConfig: ChainConfig,
  depositCap: TotalDepositResponse,
  params: AssetParamsBaseForAddr,
): Farm | undefined {
  if (!asset.poolInfo) return
  const apy = asset.poolInfo.yield.total * 100
  return {
    address: asset.poolInfo.address,
    name: asset.name,
    lockup: {
      duration: 0,
      timeframe: '',
    },
    provider: chainConfig.dexName,
    denoms: {
      primary: asset.poolInfo.assets.primary.denom,
      secondary: asset.poolInfo.assets.secondary.denom,
      lp: asset.denom,
      farm: asset.poolInfo.address,
    },
    symbols: {
      primary: asset.poolInfo.assets.primary.symbol,
      secondary: asset.poolInfo.assets.secondary.symbol,
    },
    ltv: {
      max: Number(params?.max_loan_to_value ?? 0),
      liq: Number(params?.liquidation_threshold ?? 0),
    },
    cap: {
      denom: asset.denom,
      used: BN(depositCap?.amount ?? 0).shiftedBy(-asset.decimals),
      max: BN(depositCap?.cap ?? 0).shiftedBy(-asset.decimals),
    },
    assetsPerShare: asset.poolInfo.assetsPerShare,
    apy: apy,
    apr: convertApyToApr(apy, 365),
    baseApy: asset.poolInfo.yield.poolFees * 100,
    incentives: asset.poolInfo.rewards,
  }
}

export function getFarmSwapActions(
  farm: Farm,
  deposits: BNCoin[],
  reclaims: BNCoin[],
  borrowings: BNCoin[],
  assets: Asset[],
  slippage: number,
): Action[] {
  const swapActions: Action[] = []
  const coins = [...deposits, ...borrowings, ...reclaims]

  const value = getValueFromBNCoins(coins, assets)

  let primaryLeftoverValue = value.dividedBy(2)
  let secondaryLeftoverValue = value.dividedBy(2)

  const [primaryCoins, secondaryCoins, otherCoins] = coins.reduce(
    (prev, bnCoin) => {
      switch (bnCoin.denom) {
        case farm.denoms.primary:
          prev[0].push(bnCoin)
          break
        case farm.denoms.secondary:
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
    let value = getCoinValue(bnCoin, assets)
    if (value.isLessThanOrEqualTo(primaryLeftoverValue)) {
      primaryLeftoverValue = primaryLeftoverValue.minus(value)
    } else {
      value = value.minus(primaryLeftoverValue)
      primaryLeftoverValue = primaryLeftoverValue.minus(primaryLeftoverValue)
      otherCoins.push(
        BNCoin.fromDenomAndBigNumber(bnCoin.denom, getCoinAmount(bnCoin.denom, value, assets)),
      )
    }
  })

  secondaryCoins.forEach((bnCoin) => {
    let value = getCoinValue(bnCoin, assets)
    if (value.isLessThanOrEqualTo(secondaryLeftoverValue)) {
      secondaryLeftoverValue = secondaryLeftoverValue.minus(value)
    } else {
      value = value.minus(secondaryLeftoverValue)
      secondaryLeftoverValue = secondaryLeftoverValue.minus(secondaryLeftoverValue)
      otherCoins.push(
        BNCoin.fromDenomAndBigNumber(bnCoin.denom, getCoinAmount(bnCoin.denom, value, assets)),
      )
    }
  })

  otherCoins.forEach((bnCoin) => {
    let value = getCoinValue(bnCoin, assets)
    let amount = bnCoin.amount

    if (primaryLeftoverValue.isGreaterThan(0)) {
      const swapValue = value.isLessThan(primaryLeftoverValue) ? value : primaryLeftoverValue
      const swapAmount = getCoinAmount(bnCoin.denom, swapValue, assets)

      value = value.minus(swapValue)
      amount = amount.minus(swapAmount)
      primaryLeftoverValue = primaryLeftoverValue.minus(swapValue)
      if (swapAmount.isGreaterThan(BN_ZERO))
        swapActions.push(getSwapAction(bnCoin.denom, farm.denoms.primary, swapAmount, slippage))
    }

    if (secondaryLeftoverValue.isGreaterThan(0)) {
      secondaryLeftoverValue = secondaryLeftoverValue.minus(value)
      if (amount.isGreaterThan(BN_ZERO))
        swapActions.push(getSwapAction(bnCoin.denom, farm.denoms.secondary, amount, slippage))
    }
  })

  return swapActions
}

export function getEnterFarmActions(
  farm: Farm,
  primaryCoin: BNCoin,
  secondaryCoin: BNCoin,
  slippage: number,
): Action[] {
  primaryCoin.amount = primaryCoin.amount.times(0.8).integerValue()
  secondaryCoin.amount = secondaryCoin.amount.times(0.8).integerValue()

  // TODO: Enter Farm Actions
  return []
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

export function getFarmDepositCoinsFromActions(actions: Action[]) {
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

export function getFarmDepositCoinsAndValue(
  farm: Farm,
  deposits: BNCoin[],
  borrowings: BNCoin[],
  reclaims: BNCoin[],
  slippage: number,
  assets: Asset[],
) {
  const depositsAndReclaims = mergeBNCoinArrays(deposits, reclaims)
  const borrowingsAndDepositsAndReclaims = mergeBNCoinArrays(borrowings, depositsAndReclaims)

  // The slippage is to account for rounding errors. Otherwise, it might happen we try to deposit more value
  // into the farms than there are funds available.
  const totalValue = getValueFromBNCoins(borrowingsAndDepositsAndReclaims, assets).times(
    1 - slippage,
  )
  const halfValue = totalValue.dividedBy(2)

  const primaryAsset = assets.find(byDenom(farm.denoms.primary)) ?? assets[0]
  const secondaryAsset = assets.find(byDenom(farm.denoms.secondary)) ?? assets[0]

  // The buffer is needed as sometimes the pools are a bit skew, or because of other inaccuracies in the messages
  const primaryDepositAmount = halfValue
    .dividedBy(getTokenPrice(primaryAsset.denom, assets))
    .shiftedBy(primaryAsset.decimals)
    .times(VAULT_DEPOSIT_BUFFER)
    .integerValue()

  const secondaryDepositAmount = halfValue
    .dividedBy(getTokenPrice(secondaryAsset.denom, assets))
    .shiftedBy(secondaryAsset.decimals)
    .times(VAULT_DEPOSIT_BUFFER)
    .integerValue()

  return {
    primaryCoin: new BNCoin({
      denom: farm.denoms.primary,
      amount: primaryDepositAmount.toString(),
    }),
    secondaryCoin: new BNCoin({
      denom: farm.denoms.secondary,
      amount: secondaryDepositAmount.toString(),
    }),
    totalValue: totalValue,
  }
}

export function getFarmSharesFromCoins(farm: Farm, coins: BNCoin[], assets: Asset[]): BigNumber {
  let totalValue = BN_ZERO

  coins.forEach((coin) => {
    const asset = assets.find(byDenom(coin.denom))
    if (!asset) return

    totalValue = totalValue.plus(
      coin.amount.times(asset.price?.amount ?? 0).shiftedBy(-asset.decimals),
    )
  })

  const farmAsset = assets.find(byDenom(farm.denoms.lp))
  if (!farmAsset || !farmAsset.price) return BN_ZERO

  return totalValue.dividedBy(farmAsset.price.amount).shiftedBy(farmAsset.decimals)
}

export function getDepositedFarmFromStakedLpBNCoin(
  assets: Asset[],
  stakedAstroLp: BNCoin,
  farm: Farm,
) {
  const asset = assets.find(byDenom(stakedAstroLp.denom))
  if (!asset || !asset.poolInfo) return
  const primaryAsset = assets.find(byDenom(asset.poolInfo.assets.primary.denom))
  const secondaryAsset = assets.find(byDenom(asset.poolInfo.assets.secondary.denom))

  if (!primaryAsset || !secondaryAsset) return
  const totalValue = stakedAstroLp.amount.times(asset.price?.amount ?? 0).shiftedBy(-asset.decimals)
  const halfValue = totalValue.dividedBy(2)

  const primaryAssetAmount = halfValue
    .dividedBy(primaryAsset.price?.amount ?? 0)
    .shiftedBy(primaryAsset.decimals)
  const secondaryAssetAmount = halfValue
    .dividedBy(secondaryAsset.price?.amount ?? 0)
    .shiftedBy(secondaryAsset.decimals)

  const amountsAndValues: FarmValuesAndAmounts = {
    amounts: {
      primary: primaryAssetAmount,
      secondary: secondaryAssetAmount,
    },
    values: {
      primary: halfValue,
      secondary: halfValue,
    },
  }

  return { ...farm, ...amountsAndValues } as DepositedFarm
}
