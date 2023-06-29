import debounce from 'debounce-promise'
import { useMemo, useState } from 'react'

import { hardcodedFee } from 'utils/constants'
import getMinLpToReceive from 'api/vaults/getMinLpToReceive'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import {
  getEnterVaultActions,
  getVaultDepositCoinsAndValue,
  getVaultSwapActions,
} from 'utils/vaults'
import { BN } from 'utils/helpers'

interface Props {
  vault: Vault
  deposits: BNCoin[]
  borrowings: BNCoin[]
}
export default function useDepositVault(props: Props): { actions: Action[]; fee: StdFee } {
  const [minLpToReceive, setMinLpToReceive] = useState<BigNumber>(BN(0))
  const { data: prices } = usePrices()
  const slippage = useStore((s) => s.slippage)

  const debouncedGetMinLpToReceive = useMemo(() => debounce(getMinLpToReceive, 500), [])

  const { primaryCoin, secondaryCoin, totalValue } = useMemo(
    () =>
      getVaultDepositCoinsAndValue(
        props.vault,
        props.deposits.filter((borrowing) => borrowing.amount.gt(0)),
        props.borrowings.filter((borrowing) => borrowing.amount.gt(0)),
        prices,
      ),
    [props.deposits, props.borrowings, props.vault, prices],
  )

  const borrowActions: Action[] = useMemo(() => {
    return props.borrowings.map((bnCoin) => ({
      borrow: bnCoin.toCoin(),
    }))
  }, [props.borrowings])

  const swapActions: Action[] = useMemo(
    () =>
      getVaultSwapActions(
        props.vault,
        props.deposits.filter((borrowing) => borrowing.amount.gt(0)),
        props.borrowings.filter((borrowing) => borrowing.amount.gt(0)),
        prices,
        slippage,
        totalValue,
      ),
    [totalValue, prices, props.vault, props.deposits, props.borrowings, slippage],
  )

  useMemo(async () => {
    if (primaryCoin.amount.isZero() || secondaryCoin.amount.isZero()) return

    const lpAmount = await debouncedGetMinLpToReceive(
      [secondaryCoin.toCoin(), primaryCoin.toCoin()],
      props.vault.denoms.lp,
      slippage,
    )

    if (!lpAmount || lpAmount.eq(minLpToReceive)) return
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
    return getEnterVaultActions(props.vault, primaryCoin, secondaryCoin, minLpToReceive)
  }, [props.vault, primaryCoin, secondaryCoin, minLpToReceive])

  const actions = useMemo(
    () => [...borrowActions, ...swapActions, ...enterVaultActions],
    [borrowActions, swapActions, enterVaultActions],
  )

  return { actions, fee: hardcodedFee }
}
