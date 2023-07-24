import debounce from 'debounce-promise'
import { useMemo, useState } from 'react'

import getMinLpToReceive from 'api/vaults/getMinLpToReceive'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { SLIPPAGE_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { hardcodedFee } from 'utils/constants'
import { BN } from 'utils/helpers'
import {
  getEnterVaultActions,
  getVaultDepositCoinsAndValue,
  getVaultSwapActions,
} from 'utils/vaults'

interface Props {
  vault: Vault
  deposits: BNCoin[]
  borrowings: BNCoin[]
}
export default function useDepositVault(props: Props): {
  actions: Action[]
  fee: StdFee
  minLpToReceive: string
  totalValue: BigNumber
} {
  const [minLpToReceive, setMinLpToReceive] = useState<BigNumber>(BN(0))
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

  const debouncedGetMinLpToReceive = useMemo(() => debounce(getMinLpToReceive, 500), [])

  const { primaryCoin, secondaryCoin, totalValue } = useMemo(
    () => getVaultDepositCoinsAndValue(props.vault, deposits, borrowings, prices),
    [deposits, borrowings, props.vault, prices],
  )

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
    () => [...borrowActions, ...swapActions, ...enterVaultActions],
    [borrowActions, swapActions, enterVaultActions],
  )

  return {
    actions,
    fee: hardcodedFee,
    minLpToReceive: minLpToReceive.toString(),
    totalValue,
  }
}
