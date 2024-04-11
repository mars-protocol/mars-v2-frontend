import { useMemo } from 'react'

import useAllAssets from 'hooks/assets/useAllAssets'
import useLendEnabledAssets from 'hooks/assets/useLendEnabledAssets'
import usePrices from 'hooks/prices/usePrices'
import useSlippage from 'hooks/settings/useSlippage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { BNCoin } from 'types/classes/BNCoin'
import { AccountKind, Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import {
  getEnterVaultActions,
  getVaultDepositCoinsAndValue,
  getVaultSwapActions,
} from 'utils/vaults'

interface Props {
  vault: Vault
  reclaims: BNCoin[]
  deposits: BNCoin[]
  borrowings: BNCoin[]
  kind: AccountKind
}

export default function useDepositVault(props: Props): {
  actions: Action[]
  totalValue: BigNumber
} {
  const lendEnabledAssets = useLendEnabledAssets()
  const assets = useAllAssets()
  const { data: prices } = usePrices()
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

  const { primaryCoin, secondaryCoin, totalValue } = useMemo(
    () =>
      getVaultDepositCoinsAndValue(
        props.vault,
        deposits,
        borrowings,
        reclaims,
        prices,
        slippage,
        assets,
      ),
    [props.vault, deposits, borrowings, reclaims, prices, slippage, assets],
  )

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
    () =>
      getVaultSwapActions(props.vault, deposits, reclaims, borrowings, prices, assets, slippage),
    [props.vault, deposits, reclaims, borrowings, prices, assets, slippage],
  )

  const enterVaultActions: Action[] = useMemo(() => {
    if (primaryCoin.amount.isZero() || secondaryCoin.amount.isZero()) return []

    return getEnterVaultActions(props.vault, primaryCoin, secondaryCoin, slippage)
  }, [props.vault, primaryCoin, secondaryCoin, slippage])

  const lendActions: Action[] = useMemo(() => {
    if (!isAutoLend || props.kind === 'high_levered_strategy') return []

    const denoms = [props.vault.denoms.primary, props.vault.denoms.secondary]
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
    props.vault.denoms.primary,
    props.vault.denoms.secondary,
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
