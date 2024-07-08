import { useMemo } from 'react'

import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useLendEnabledAssets from 'hooks/assets/useLendEnabledAssets'
import useSlippage from 'hooks/settings/useSlippage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { BNCoin } from 'types/classes/BNCoin'
import { AccountKind, Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getEnterFarmActions, getFarmDepositCoinsAndValue } from 'utils/farms'
import { getLiquidityPoolSwapActions } from 'utils/liquidityPool'
import { getEnterVaultActions, getVaultDepositCoinsAndValue } from 'utils/vaults'

interface Props {
  pool: Vault | Farm
  reclaims: BNCoin[]
  deposits: BNCoin[]
  borrowings: BNCoin[]
  kind: AccountKind
  isFarm?: boolean
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
    if (props.isFarm)
      return getFarmDepositCoinsAndValue(
        props.pool as Farm,
        deposits,
        borrowings,
        reclaims,
        slippage,
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
  }, [props.pool, deposits, borrowings, reclaims, slippage, assets, props.isFarm])

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

  const swapActions: Action[] = useMemo(
    () => getLiquidityPoolSwapActions(props.pool, deposits, reclaims, borrowings, assets, slippage),
    [props.pool, deposits, reclaims, borrowings, assets, slippage],
  )

  const enterVaultActions: Action[] = useMemo(() => {
    if (primaryCoin.amount.isZero() || secondaryCoin.amount.isZero()) return []
    if (props.isFarm)
      return getEnterFarmActions(props.pool as Farm, primaryCoin, secondaryCoin, slippage)
    return getEnterVaultActions(props.pool as Vault, primaryCoin, secondaryCoin, slippage)
  }, [props.pool, primaryCoin, secondaryCoin, slippage, props.isFarm])

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
      ...enterVaultActions,
      ...lendActions,
      ...refundActions,
    ]
  }, [
    depositActions,
    reclaimActions,
    borrowActions,
    swapActions,
    enterVaultActions,
    lendActions,
    refundActions,
  ])

  return {
    actions,
    totalValue,
  }
}
