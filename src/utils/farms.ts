import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import {
  AssetParamsBaseForAddr,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { byDenom } from 'utils/array'
import { BN, getBNCoinFromValue, getValueFromBNCoins, mergeBNCoinArrays } from 'utils/helpers'
import { convertApyToApr } from 'utils/parsers'

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
      used: BN(depositCap?.amount ?? 0),
      max: BN(depositCap?.cap ?? 0),
    },
    assetsPerShare: asset.poolInfo.assetsPerShare,
    apy: apy,
    apr: convertApyToApr(apy, 365),
    baseApy: asset.poolInfo.yield.poolFees * 100,
    incentives: asset.poolInfo.rewards,
  }
}

export function getFarmSharesFromCoinsValue(
  farm: Farm,
  coinsValue: BigNumber,
  assets: Asset[],
): BigNumber {
  const farmAsset = assets.find(byDenom(farm.denoms.lp))
  if (!farmAsset || !farmAsset.price) return BN_ZERO

  return coinsValue.dividedBy(farmAsset.price.amount).shiftedBy(farmAsset.decimals)
}

export function getFarmCoinsFromShares(farmShares: BNCoin, farm: Farm, assets: Asset[]): BNCoin[] {
  const coins = [] as BNCoin[]
  const farmValuesAndAmounts = getDepositedFarmFromStakedLpBNCoin(assets, farmShares, farm)
  if (!farmValuesAndAmounts) return coins

  coins.push(
    BNCoin.fromDenomAndBigNumber(farm.denoms.primary, farmValuesAndAmounts.amounts.primary),
    BNCoin.fromDenomAndBigNumber(farm.denoms.secondary, farmValuesAndAmounts.amounts.secondary),
  )

  return coins
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
      primary: primaryAssetAmount.integerValue(),
      secondary: secondaryAssetAmount.integerValue(),
    },
    values: {
      primary: halfValue,
      secondary: halfValue,
    },
  }

  return { ...farm, ...amountsAndValues } as DepositedFarm
}

export function getEnterFarmActions(
  farm: Farm,
  primaryCoin: BNCoin,
  secondaryCoin: BNCoin,
  slippage: number,
): Action[] {
  return [
    {
      provide_liquidity: {
        // Smart Contact demands that secondary coin is first
        coins_in: [secondaryCoin.toActionCoin(), primaryCoin.toActionCoin()],
        lp_token_out: farm.denoms.lp,
        slippage: slippage.toString(),
      },
    },
    {
      stake_astro_lp: {
        lp_token: { denom: farm.denoms.lp, amount: 'account_balance' },
      },
    },
  ]
}

export function getFarmDepositCoinsAndValue(
  farm: Farm,
  deposits: BNCoin[],
  borrowings: BNCoin[],
  reclaims: BNCoin[],
  assets: Asset[],
) {
  const depositsAndReclaims = mergeBNCoinArrays(deposits, reclaims)

  const depositsAndReclaimsValue = getValueFromBNCoins(depositsAndReclaims, assets)
  const borrowingValue = getValueFromBNCoins(borrowings, assets)

  const totalValue = depositsAndReclaimsValue.plus(borrowingValue)
  const primaryAsset = assets.find(byDenom(farm.denoms.primary)) ?? assets[0]
  const secondaryAsset = assets.find(byDenom(farm.denoms.secondary)) ?? assets[0]

  const primaryDepositAmount = getBNCoinFromValue(totalValue.dividedBy(2), primaryAsset).amount

  const secondaryDepositAmount = getBNCoinFromValue(totalValue.dividedBy(2), secondaryAsset).amount

  return {
    primaryCoin: new BNCoin({
      denom: farm.denoms.primary,
      amount: primaryDepositAmount.integerValue().toString(),
    }),
    secondaryCoin: new BNCoin({
      denom: farm.denoms.secondary,
      amount: secondaryDepositAmount.integerValue().toString(),
    }),
    totalValue,
  }
}

export function getFarmAprs(stakedAstroLp: BNCoin[], assets: Asset[]): Apr[] {
  return stakedAstroLp.map((lp) => {
    const asset = assets.find(byDenom(lp.denom))
    if (!asset) return { address: lp.denom, apr: 0 }
    return { address: lp.denom, apr: convertApyToApr(asset.poolInfo?.yield?.total ?? 0, 365) }
  })
}
