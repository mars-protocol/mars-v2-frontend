import { useMemo } from 'react'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  borrowCoin: BNCoin
  depositCoin: BNCoin
}

export default function useDepositActions(props: Props) {
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)

  return useMemo(
    () => [
      {
        deposit: props.depositCoin.toCoin(),
      },
      ...(props.borrowCoin.amount.isZero()
        ? []
        : [
            {
              borrow: props.borrowCoin.toCoin(),
            },
            {
              swap_exact_in: {
                denom_out: props.depositCoin.denom,
                slippage: slippage.toString(),
                coin_in: props.borrowCoin.toActionCoin(),
              },
            },
          ]),
    ],
    [props.borrowCoin, props.depositCoin, slippage],
  )
}
