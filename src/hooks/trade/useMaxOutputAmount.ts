import { BN_ZERO } from 'constants/math'
import useRouteInfo from 'hooks/trade/useRouteInfo'
import { useMemo } from 'react'

export default function useMaxOutputAmount(denomIn: string, denomOut: string, amount: BigNumber) {
  const { data: routeInfo } = useRouteInfo(denomIn, denomOut, amount)
  return useMemo(() => routeInfo?.amountOut ?? BN_ZERO, [routeInfo])
}
