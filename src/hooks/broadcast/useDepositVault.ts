import { useMemo } from 'react'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { SLIPPAGE_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
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
}

export default function useDepositVault(props: Props): {
  actions: Action[]
  totalValue: BigNumber
} {
  const { data: prices } = usePrices()
  const [slippage] = useLocalStorage<number>(SLIPPAGE_KEY, DEFAULT_SETTINGS.slippage)

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
    () => getVaultDepositCoinsAndValue(props.vault, deposits, borrowings, reclaims, prices),
    [reclaims, deposits, borrowings, props.vault, prices],
  )

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
    () => getVaultSwapActions(props.vault, deposits, borrowings, prices, slippage, totalValue),
    [totalValue, prices, props.vault, deposits, borrowings, slippage],
  )

  const enterVaultActions: Action[] = useMemo(() => {
    if (primaryCoin.amount.isZero() || secondaryCoin.amount.isZero()) return []

    return getEnterVaultActions(props.vault, primaryCoin, secondaryCoin, slippage)
  }, [props.vault, primaryCoin, secondaryCoin, slippage])

  const actions = useMemo(
    () => [...reclaimActions, ...borrowActions, ...swapActions, ...enterVaultActions],
    [reclaimActions, borrowActions, swapActions, enterVaultActions],
  )

  return {
    actions,
    totalValue,
  }
}