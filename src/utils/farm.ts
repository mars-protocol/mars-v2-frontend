import getRouteInfo from 'api/swap/getRouteInfo'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getAstroLpBaseDepositCoinsAndValue, getEnterAstroLpActions } from 'utils/astroLps'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { getValueFromBNCoins } from 'utils/helpers'
import { getSwapExactInAction } from 'utils/swap'
import { getEnterVaultActions, getVaultBaseDepositCoinsAndValue } from 'utils/vaults'

export function getFarmDepositsActions(deposits: BNCoin[]): Action[] {
  return deposits
    .filter((deposit) => deposit.amount.gt(0))
    .map((bnCoin) => ({
      deposit: bnCoin.toCoin(),
    }))
}

export function getFarmDepositsReclaimsAndBorrowingsActions(
  deposits: BNCoin[],
  reclaims: BNCoin[],
  borrowings: BNCoin[],
): { depositActions: Action[]; reclaimActions: Action[]; borrowActions: Action[] } {
  const depositActions = deposits
    .filter((deposit) => deposit.amount.gt(0))
    .map((bnCoin) => ({
      deposit: bnCoin.toCoin(),
    }))

  const reclaimActions = reclaims
    .filter((reclaim) => reclaim.amount.gt(0))
    .map((bnCoin) => ({
      reclaim: bnCoin.toActionCoin(),
    }))

  const borrowActions = borrowings
    .filter((borrowing) => borrowing.amount.gt(0))
    .map((bnCoin) => ({
      borrow: bnCoin.toCoin(),
    }))

  return {
    depositActions,
    reclaimActions,
    borrowActions,
  }
}

export function getFarmLendActions(farm: Vault | AstroLp, assets: Asset[]): Action[] {
  const denoms = [farm.denoms.primary, farm.denoms.secondary]
  const denomsForLend = assets
    .filter((asset) => denoms.includes(asset.denom))
    .map((asset) => asset.denom)

  return denomsForLend.map((denom) => ({
    lend: {
      denom,
      amount: 'account_balance',
    },
  }))
}

export function getFarmRefundActions(): Action[] {
  return [
    {
      refund_all_coin_balances: {},
    },
  ]
}

export function getFarmProvideLiquidityActions(
  farm: Vault | AstroLp,
  deposits: BNCoin[],
  borrowings: BNCoin[],
  reclaims: BNCoin[],
  assets: Asset[],
  slippage: number,
  swapCoins: FarmSwapCoins,
  isAstroportLp: boolean,
): Action[] {
  const primaryCoin = BNCoin.fromDenomAndBigNumber(farm.denoms.primary, BN_ZERO)
  const secondaryCoin = BNCoin.fromDenomAndBigNumber(farm.denoms.secondary, BN_ZERO)
  if (isAstroportLp) {
    const { primaryCoin: astroLpPrimaryCoin, secondaryCoin: astroLpSecondaryCoin } =
      getAstroLpBaseDepositCoinsAndValue(farm as AstroLp, deposits, borrowings, reclaims, assets)
    primaryCoin.amount = astroLpPrimaryCoin.amount.plus(swapCoins.primary.amount)
    secondaryCoin.amount = astroLpSecondaryCoin.amount.plus(swapCoins.secondary.amount)

    return getEnterAstroLpActions(farm as AstroLp, primaryCoin, secondaryCoin, slippage)
  } else {
    const { primaryCoin: vaultPrimaryCoin, secondaryCoin: vaultSecondaryCoin } =
      getVaultBaseDepositCoinsAndValue(
        farm as Vault,
        deposits,
        borrowings,
        reclaims,
        slippage,
        assets,
      )
    primaryCoin.amount = vaultPrimaryCoin.amount.plus(swapCoins.primary.amount).integerValue()
    secondaryCoin.amount = vaultSecondaryCoin.amount.plus(swapCoins.secondary.amount).integerValue()
    return getEnterVaultActions(farm as Vault, primaryCoin, secondaryCoin, slippage)
  }
}

export async function getFarmSwapActionsAndOutputCoins(
  farm: Vault | AstroLp,
  deposits: BNCoin[],
  reclaims: BNCoin[],
  borrowings: BNCoin[],
  assets: Asset[],
  slippage: number,
  chainConfig: ChainConfig,
  isAstroLp: boolean,
): Promise<{ swapActions: Action[]; swapCoins: FarmSwapCoins }> {
  const swapActions: Action[] = []
  const coins = [...deposits, ...borrowings, ...reclaims]

  const value = getValueFromBNCoins(coins, assets)

  let primaryLeftoverValue = value.dividedBy(2)
  let secondaryLeftoverValue = value.dividedBy(2)

  const swapCoins = {
    primary: BNCoin.fromDenomAndBigNumber(farm.denoms.primary, BN_ZERO),
    secondary: BNCoin.fromDenomAndBigNumber(farm.denoms.secondary, BN_ZERO),
  }

  const [primaryCoins, secondaryCoins, otherCoins] = reduceFarmCoins(coins, farm)

  // Astroport only logic:
  if (isAstroLp) {
    // don't swap anything if there is no other coins than pool coins
    if (otherCoins.length === 0) return { swapActions: [], swapCoins }

    // if one of the coins arrays is empty, swap to its denom only
    if (
      (primaryCoins.length === 0 && secondaryCoins.length !== 0) ||
      (primaryCoins.length !== 0 && secondaryCoins.length === 0)
    ) {
      for (const bnCoin of otherCoins) {
        const swapTo = primaryCoins.length === 0 ? 'primary' : 'secondary'
        const astroSwapUrl = `${chainConfig.endpoints.routes}?start=${bnCoin.denom}&end=${farm.denoms[swapTo]}&amount=${bnCoin.amount}&chainId=${chainConfig.id}&limit=1`
        const astroRouteInfo = await getRouteInfo(astroSwapUrl, farm.denoms[swapTo], assets, false)
        if (astroRouteInfo) {
          swapCoins[swapTo].amount = swapCoins[swapTo].amount.plus(
            astroRouteInfo.amountOut.times(1 - slippage),
          )

          swapActions.push(
            getSwapExactInAction(
              BNCoin.fromDenomAndBigNumber(bnCoin.denom, bnCoin.amount).toActionCoin(),
              farm.denoms[swapTo],
              astroRouteInfo,
              slippage,
              false,
            ),
          )
        }
      }
      return { swapActions, swapCoins }
    }
  }

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

  for (const bnCoin of otherCoins) {
    let value = getCoinValue(bnCoin, assets)
    let amount = bnCoin.amount

    if (primaryLeftoverValue.isGreaterThan(0)) {
      const swapValue = value.isLessThan(primaryLeftoverValue) ? value : primaryLeftoverValue
      const swapAmount = getCoinAmount(bnCoin.denom, swapValue, assets)

      value = value.minus(swapValue)
      amount = amount.minus(swapAmount)
      primaryLeftoverValue = primaryLeftoverValue.minus(swapValue)

      const primarySwapUrl = chainConfig.isOsmosis
        ? `${chainConfig.endpoints.routes}/quote?tokenIn=${swapAmount}${bnCoin.denom}&tokenOutDenom=${farm.denoms.primary}`
        : `${chainConfig.endpoints.routes}?start=${bnCoin.denom}&end=${farm.denoms.primary}&amount=${swapAmount}&chainId=${chainConfig.id}&limit=1`
      const primarySwapRouteInfo = await getRouteInfo(
        primarySwapUrl,
        farm.denoms.primary,
        assets,
        chainConfig.isOsmosis,
      )

      if (swapAmount.isGreaterThan(BN_ZERO) && primarySwapRouteInfo) {
        swapCoins.primary.amount = swapCoins.primary.amount.plus(
          primarySwapRouteInfo.amountOut.times(1 - slippage),
        )

        swapActions.push(
          getSwapExactInAction(
            BNCoin.fromDenomAndBigNumber(bnCoin.denom, swapAmount).toActionCoin(),
            farm.denoms.primary,
            primarySwapRouteInfo,
            slippage,
            chainConfig.isOsmosis,
          ),
        )
      }
    }

    if (secondaryLeftoverValue.isGreaterThan(0)) {
      secondaryLeftoverValue = secondaryLeftoverValue.minus(value)

      const secondarySwapUrl = chainConfig.isOsmosis
        ? `${chainConfig.endpoints.routes}/quote?tokenIn=${amount}${bnCoin.denom}&tokenOutDenom=${farm.denoms.secondary}`
        : `${chainConfig.endpoints.routes}?start=${bnCoin.denom}&end=${farm.denoms.secondary}&amount=${amount}&chainId=${chainConfig.id}&limit=1`
      const secondarySwapRouteInfo = await getRouteInfo(
        secondarySwapUrl,
        farm.denoms.primary,
        assets,
        chainConfig.isOsmosis,
      )

      if (amount.isGreaterThan(BN_ZERO) && secondarySwapRouteInfo) {
        swapCoins.secondary.amount = swapCoins.secondary.amount.plus(
          secondarySwapRouteInfo.amountOut.times(1 - slippage),
        )

        swapActions.push(
          getSwapExactInAction(
            BNCoin.fromDenomAndBigNumber(bnCoin.denom, amount).toActionCoin(),
            farm.denoms.secondary,
            secondarySwapRouteInfo,
            slippage,
            chainConfig.isOsmosis,
          ),
        )
      }
    }
  }
  return { swapActions, swapCoins }
}

export async function getFarmActions(
  farm: Vault | AstroLp,
  deposits: BNCoin[],
  reclaims: BNCoin[],
  borrowings: BNCoin[],
  assets: Asset[],
  slippage: number,
  chainConfig: ChainConfig,
  isAutoLend: boolean,
  isAstroLp: boolean,
  isHighLeverage: boolean,
): Promise<Action[]> {
  const lendEnabledAssets = assets.filter((asset) => asset.isAutoLendEnabled)

  const depositActions = isHighLeverage ? getFarmDepositsActions(deposits) : []

  const { reclaimActions, borrowActions } = getFarmDepositsReclaimsAndBorrowingsActions(
    deposits,
    reclaims,
    borrowings,
  )

  const { swapActions, swapCoins } = await getFarmSwapActionsAndOutputCoins(
    farm,
    deposits,
    reclaims,
    borrowings,
    assets,
    slippage,
    chainConfig,
    isAstroLp,
  )

  const provideLiquidityActions = getFarmProvideLiquidityActions(
    farm,
    deposits,
    borrowings,
    reclaims,
    assets,
    slippage,
    swapCoins,
    isAstroLp,
  )

  const hasLendActions =
    (chainConfig.isOsmosis && swapActions.length > 0 && isAutoLend) ||
    (!chainConfig.isOsmosis && isAutoLend)

  const lendActions: Action[] = hasLendActions ? getFarmLendActions(farm, lendEnabledAssets) : []

  return [
    ...depositActions,
    ...reclaimActions,
    ...borrowActions,
    ...swapActions,
    ...provideLiquidityActions,
    ...lendActions,
  ]
}

function reduceFarmCoins(coins: BNCoin[], farm: Vault | AstroLp): [BNCoin[], BNCoin[], BNCoin[]] {
  const primaryCoins = [] as BNCoin[]
  const secondaryCoins = [] as BNCoin[]
  const otherCoins = [] as BNCoin[]

  coins.forEach((coin) => {
    if (coin.amount.isZero()) return
    if (coin.denom === farm.denoms.primary) primaryCoins.push(coin)
    else if (coin.denom === farm.denoms.secondary) secondaryCoins.push(coin)
    else otherCoins.push(coin)
  })

  return [primaryCoins, secondaryCoins, otherCoins]
}
