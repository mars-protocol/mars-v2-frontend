import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useStakedAstroLpRewards from 'hooks/incentives/useStakedAstroLpRewards'
import useMarkets from 'hooks/markets/useMarkets'
import useSlippage from 'hooks/settings/useSlippage'
import useRouteInfo from 'hooks/trade/useRouteInfo'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { byDenom } from 'utils/array'
import { getAstroLpCoinsFromShares } from 'utils/astroLps'
import { BN } from 'utils/helpers'
import { getSwapExactInAction } from 'utils/swap'
import { getDebtAmountWithInterest } from 'utils/tokens'

interface Props {
  hlsFarm: DepositedHlsFarm
}

export default function useHlsCloseFarmingPositionActions(props: Props): {
  actions: Action[] | null
  changes: HlsClosingChanges | null
  isLoadingRoute: boolean
} {
  const { account, farm, borrowAsset } = props.hlsFarm
  const { data: assets } = useAssets()
  const [slippage] = useSlippage()
  const markets = useMarkets()
  const borrowDenom = borrowAsset.denom
  const zeroCoin = BNCoin.fromDenomAndBigNumber(farm.denoms.primary, BN_ZERO)
  const { data: stakedAstroLpRewards } = useStakedAstroLpRewards(farm.denoms.lp, account.id)

  const currentLpRewards = useMemo(() => {
    if (stakedAstroLpRewards.length === 0) return []
    return stakedAstroLpRewards[0].rewards
  }, [stakedAstroLpRewards])

  const debtAmount: BigNumber = useMemo(() => {
    const market = markets.find((market) => market.asset.denom === borrowDenom)
    if (!market) return BN_ZERO

    return getDebtAmountWithInterest(
      account.debts.find(byDenom(borrowDenom))?.amount || BN_ZERO,
      market.apy.borrow,
    )
  }, [account.debts, borrowDenom, markets])

  const underlyingAssets = getAstroLpCoinsFromShares(account.stakedAstroLps[0], farm, assets)
  const [debtAssetPartOfShare, collateralAssetPartOfShare] = useMemo(() => {
    if (underlyingAssets.length !== 2) return [zeroCoin, zeroCoin]
    if (underlyingAssets[0].denom === borrowDenom) return [underlyingAssets[0], underlyingAssets[1]]
    return [underlyingAssets[1], underlyingAssets[0]]
  }, [underlyingAssets, borrowDenom, zeroCoin])

  const amountToRepayDebt = debtAssetPartOfShare.amount
  const collateralAmount = collateralAssetPartOfShare.amount

  const amountLeftToRepay = Math.max(debtAmount.minus(amountToRepayDebt).toNumber(), 0)

  // This estimates the rough collateral amount we need to swap in order to repay the debt
  const { data: routeInfoForCollateralAmount } = useRouteInfo(
    borrowDenom,
    collateralAssetPartOfShare.denom,
    BN(amountLeftToRepay).integerValue(),
  )

  const swapInAmount = useMemo(() => {
    if (!routeInfoForCollateralAmount) return BN_ZERO

    return BigNumber.min(
      routeInfoForCollateralAmount.amountOut.times(1 + slippage),
      collateralAmount,
    )
  }, [routeInfoForCollateralAmount, collateralAmount, slippage])

  const { data: routeInfo } = useRouteInfo(
    collateralAssetPartOfShare.denom,
    borrowDenom,
    swapInAmount.integerValue(),
  )

  const fundsLeftAfterSwap = useMemo(() => {
    if (amountLeftToRepay === 0) {
      return [
        BNCoin.fromDenomAndBigNumber(
          debtAssetPartOfShare.denom,
          debtAssetPartOfShare.amount.minus(debtAmount),
        ),
        collateralAssetPartOfShare,
      ]
    }
    if (!routeInfo) return underlyingAssets

    return [
      BNCoin.fromDenomAndBigNumber(debtAssetPartOfShare.denom, BN_ZERO),
      BNCoin.fromDenomAndBigNumber(
        collateralAssetPartOfShare.denom,
        collateralAmount.minus(swapInAmount),
      ),
    ]
  }, [
    amountLeftToRepay,
    collateralAmount,
    collateralAssetPartOfShare,
    debtAmount,
    debtAssetPartOfShare,
    routeInfo,
    swapInAmount,
    underlyingAssets,
  ])

  return useMemo<{
    actions: Action[] | null
    changes: HlsClosingChanges | null
    isLoadingRoute: boolean
  }>(() => {
    const swapExactIn =
      debtAmount.isZero() || !routeInfo
        ? null
        : getSwapExactInAction(
            BNCoin.fromDenomAndBigNumber(
              collateralAssetPartOfShare.denom,
              swapInAmount,
            ).toActionCoin(),
            borrowDenom,
            routeInfo,
            slippage,
          )

    return {
      actions: [
        {
          unstake_astro_lp: {
            lp_token: account.stakedAstroLps[0].toActionCoin(true),
          },
        },
        {
          withdraw_liquidity: {
            lp_token: account.stakedAstroLps[0].toActionCoin(true),
            slippage: slippage.toString(),
          },
        },
        ...(!swapExactIn
          ? []
          : [
              swapExactIn,
              {
                repay: {
                  coin: BNCoin.fromDenomAndBigNumber(
                    borrowDenom,
                    debtAmount.times(1.0001).integerValue(), // Over pay to by-pass increase in debt
                  ).toActionCoin(),
                },
              },
            ]),
        { refund_all_coin_balances: {} },
      ],
      changes: {
        widthdraw: underlyingAssets,
        swap: !swapExactIn
          ? null
          : {
              coinIn: BNCoin.fromDenomAndBigNumber(collateralAssetPartOfShare.denom, swapInAmount),
              coinOut: BNCoin.fromDenomAndBigNumber(borrowDenom, routeInfo?.amountOut ?? BN_ZERO),
            },
        repay: debtAmount.isZero() ? null : BNCoin.fromDenomAndBigNumber(borrowDenom, debtAmount),
        refund: fundsLeftAfterSwap,
        rewards: currentLpRewards,
      },
      isLoadingRoute: amountLeftToRepay > 0 && !debtAmount.isZero() && !routeInfo,
    }
  }, [
    account.stakedAstroLps,
    amountLeftToRepay,
    borrowDenom,
    collateralAssetPartOfShare.denom,
    currentLpRewards,
    debtAmount,
    fundsLeftAfterSwap,
    routeInfo,
    slippage,
    swapInAmount,
    underlyingAssets,
  ])
}
