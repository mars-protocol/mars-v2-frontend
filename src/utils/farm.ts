import getRouteInfo from 'api/swap/getRouteInfo'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { getValueFromBNCoins } from 'utils/helpers'
import { getSwapExactInAction } from 'utils/swap'

export function getFarmSwapActions(
  farm: Vault | AstroLp,
  deposits: BNCoin[],
  reclaims: BNCoin[],
  borrowings: BNCoin[],
  assets: Asset[],
  slippage: number,
  chainConfig: ChainConfig,
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

  otherCoins.forEach(async (bnCoin) => {
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

      if (swapAmount.isGreaterThan(BN_ZERO) && primarySwapRouteInfo)
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

      if (amount.isGreaterThan(BN_ZERO) && secondarySwapRouteInfo)
        swapActions.push(
          getSwapExactInAction(
            BNCoin.fromDenomAndBigNumber(bnCoin.denom, amount).toActionCoin(),
            farm.denoms.primary,
            secondarySwapRouteInfo,
            slippage,
            chainConfig.isOsmosis,
          ),
        )
    }
  })

  return swapActions
}
