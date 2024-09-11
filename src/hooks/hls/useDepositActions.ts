import { useMemo } from 'react'

import useSlippage from 'hooks/settings/useSlippage'
import { BNCoin } from 'types/classes/BNCoin'
import { getSwapExactInAction } from 'utils/swap'

interface Props {
  borrowCoin: BNCoin
  depositCoin: BNCoin
  chainConfig: ChainConfig
  routeInfo?: SwapRouteInfo | null
}

export default function useDepositActions(props: Props) {
  const { borrowCoin, depositCoin, routeInfo, chainConfig } = props

  const [slippage] = useSlippage()
  const isOsmosis = chainConfig.isOsmosis

  const swapAction = useMemo(
    () =>
      routeInfo
        ? getSwapExactInAction(
            borrowCoin.toActionCoin(),
            depositCoin.denom,
            routeInfo,
            slippage,
            isOsmosis,
          )
        : null,
    [borrowCoin, depositCoin, routeInfo, slippage, isOsmosis],
  )
  return useMemo(
    () => [
      {
        deposit: depositCoin.toCoin(),
      },
      ...(borrowCoin.amount.isGreaterThan(0)
        ? [
            {
              borrow: borrowCoin.toCoin(),
            },
          ]
        : []),
      ...(borrowCoin.amount.isZero() || swapAction === null ? [] : [swapAction]),
    ],
    [borrowCoin, depositCoin, swapAction],
  )
}
