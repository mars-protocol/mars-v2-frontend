import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useLendEnabledAssets from 'hooks/assets/useLendEnabledAssets'
import useSlippage from 'hooks/settings/useSlippage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { BNCoin } from 'types/classes/BNCoin'
import { AccountKind, Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getAstroLpDepositCoinsAndValue, getEnterAstroLpActions } from 'utils/astroLps'
import { mergeBNCoinArrays } from 'utils/helpers'
import { getFarmSwapActions } from 'utils/liquidityPool'
import { getEnterVaultActions, getVaultDepositCoinsAndValue } from 'utils/vaults'

interface Props {
  pool: Vault | AstroLp
  reclaims: BNCoin[]
  deposits: BNCoin[]
  borrowings: BNCoin[]
  kind: AccountKind
  isAstroLp?: boolean
}

export default function useDepositLiquidity(props: Props): {
  actions: Action[]
  totalValue: BigNumber
} {
  const lendEnabledAssets = useLendEnabledAssets()
  const assets = useDepositEnabledAssets()
  const [slippage] = useSlippage()
  const { isAutoLendEnabledForCurrentAccount: isAutoLend } = useAutoLend()
  const borrowings: BNCoin[] = useMemo(
    () => props.borrowings.filter((borrowing) => borrowing.amount.gt(0)),
    [props.borrowings],
  )
  const deposits: BNCoin[] = useMemo(
    () => props.deposits.filter((deposit) => deposit.amount.gt(0)),
    [props.deposits],
  )
  const reclaims: BNCoin[] = useMemo(
    () => props.reclaims.filter((reclaim) => reclaim.amount.gt(0)),
    [props.reclaims],
  )

  const { primaryCoin, secondaryCoin, totalValue } = useMemo(() => {
    if (props.isAstroLp)
      return getAstroLpDepositCoinsAndValue(
        props.pool as AstroLp,
        deposits,
        borrowings,
        reclaims,
        assets,
      )

    return getVaultDepositCoinsAndValue(
      props.pool as Vault,
      deposits,
      borrowings,
      reclaims,
      slippage,
      assets,
    )
  }, [props.pool, deposits, borrowings, reclaims, slippage, assets, props.isAstroLp])

  const depositActions: Action[] = useMemo(() => {
    if (props.kind === 'default') return []

    return deposits.map((bnCoin) => ({
      deposit: bnCoin.toCoin(),
    }))
  }, [deposits, props.kind])

  const reclaimActions: Action[] = useMemo(() => {
    return reclaims.map((bnCoin) => ({
      reclaim: bnCoin.toActionCoin(),
    }))
  }, [reclaims])

  const borrowActions: Action[] = useMemo(() => {
    return borrowings.map((bnCoin) => ({
      borrow: bnCoin.toCoin(),
    }))
  }, [borrowings])

  const swapActions: Action[] = useMemo(() => {
    if (props.isAstroLp) {
      const depositsAndReclaims = mergeBNCoinArrays(deposits, reclaims)
      const allCoins = mergeBNCoinArrays(depositsAndReclaims, borrowings)
      const hasOtherCoins =
        allCoins.filter(
          (coin) =>
            coin.denom !== props.pool.denoms.primary && coin.denom !== props.pool.denoms.secondary,
        ).length > 0
      if (!hasOtherCoins) {
        primaryCoin.amount =
          allCoins.find((coin) => coin.denom === props.pool.denoms.primary)?.amount ?? BN_ZERO
        secondaryCoin.amount =
          allCoins.find((coin) => coin.denom === props.pool.denoms.secondary)?.amount ?? BN_ZERO
        return []
      }
    }
    return getFarmSwapActions(props.pool, deposits, reclaims, borrowings, assets, slippage)
  }, [
    props.isAstroLp,
    props.pool,
    deposits,
    reclaims,
    borrowings,
    assets,
    slippage,
    primaryCoin,
    secondaryCoin,
  ])

  const enterFarmActions: Action[] = useMemo(() => {
    if (primaryCoin.amount.isZero() || secondaryCoin.amount.isZero()) return []
    if (props.isAstroLp)
      return getEnterAstroLpActions(props.pool as AstroLp, primaryCoin, secondaryCoin, slippage)
    return getEnterVaultActions(props.pool as Vault, primaryCoin, secondaryCoin, slippage)
  }, [props.pool, primaryCoin, secondaryCoin, slippage, props.isAstroLp])

  const lendActions: Action[] = useMemo(() => {
    if (!isAutoLend || props.kind === 'high_levered_strategy' || swapActions.length === 0) return []

    const denoms = [props.pool.denoms.primary, props.pool.denoms.secondary]
    const denomsForLend = lendEnabledAssets
      .filter((asset) => denoms.includes(asset.denom))
      .map((asset) => asset.denom)

    return denomsForLend.map((denom) => ({
      lend: {
        denom,
        amount: 'account_balance',
      },
    }))
  }, [
    isAutoLend,
    lendEnabledAssets,
    props.kind,
    props.pool.denoms.primary,
    props.pool.denoms.secondary,
    swapActions,
  ])

  const refundActions: Action[] = useMemo(() => {
    if (props.kind === 'default') return []

    return [
      {
        refund_all_coin_balances: {},
      },
    ]
  }, [props.kind])

  const actions = useMemo(() => {
    return [
      ...depositActions,
      ...reclaimActions,
      ...borrowActions,
      ...swapActions,
      ...enterFarmActions,
      ...lendActions,
      ...refundActions,
    ]
  }, [
    depositActions,
    reclaimActions,
    borrowActions,
    swapActions,
    enterFarmActions,
    lendActions,
    refundActions,
  ])

  return {
    actions,
    totalValue,
  }
}
