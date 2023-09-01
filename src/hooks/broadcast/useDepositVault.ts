import debounce from 'debounce-promise'
import { useMemo, useState } from 'react'

import getMinLpToReceive from 'api/vaults/getMinLpToReceive'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY, SLIPPAGE_KEY } from 'constants/localStore'
import { BN_ZERO } from 'constants/math'
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
  minLpToReceive: string
  totalValue: BigNumber
} {
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )
  const [minLpToReceive, setMinLpToReceive] = useState<BigNumber>(BN_ZERO)
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

  const debouncedGetMinLpToReceive = useMemo(() => debounce(getMinLpToReceive, 500), [])

  const { primaryCoin, secondaryCoin, totalValue } = useMemo(
    () =>
      getVaultDepositCoinsAndValue(
        props.vault,
        deposits,
        borrowings,
        reclaims,
        displayCurrency,
        prices,
      ),
    [reclaims, deposits, borrowings, props.vault, prices, displayCurrency],
  )

  const reclaimActions: Action[] = useMemo(() => {
    return props.reclaims.map((bnCoin) => ({
      reclaim: bnCoin.toActionCoin(),
    }))
  }, [props.reclaims])

  const borrowActions: Action[] = useMemo(() => {
    return borrowings.map((bnCoin) => ({
      borrow: bnCoin.toCoin(),
    }))
  }, [borrowings])

  const swapActions: Action[] = useMemo(
    () => getVaultSwapActions(props.vault, deposits, borrowings, prices, slippage, totalValue),
    [totalValue, prices, props.vault, deposits, borrowings, slippage],
  )

  useMemo(async () => {
    if (primaryCoin.amount.isZero() || secondaryCoin.amount.isZero()) return

    const lpAmount = await debouncedGetMinLpToReceive(
      [secondaryCoin.toCoin(), primaryCoin.toCoin()],
      props.vault.denoms.lp,
      slippage,
    )

    if (!lpAmount || lpAmount.isEqualTo(minLpToReceive)) return
    setMinLpToReceive(lpAmount)
  }, [
    primaryCoin,
    secondaryCoin,
    props.vault.denoms.lp,
    debouncedGetMinLpToReceive,
    minLpToReceive,
    slippage,
  ])

  const enterVaultActions: Action[] = useMemo(() => {
    if (primaryCoin.amount.isZero() || secondaryCoin.amount.isZero() || minLpToReceive.isZero())
      return []

    return getEnterVaultActions(props.vault, primaryCoin, secondaryCoin, minLpToReceive)
  }, [props.vault, primaryCoin, secondaryCoin, minLpToReceive])

  const actions = useMemo(
    () => [...reclaimActions, ...borrowActions, ...swapActions, ...enterVaultActions],
    [reclaimActions, borrowActions, swapActions, enterVaultActions],
  )

  return {
    actions,
    minLpToReceive: minLpToReceive.toString(),
    totalValue,
  }
}
