import { BN_ZERO } from 'constants/math'
import { useMemo } from 'react'
import useRouteInfo from 'hooks/trade/useRouteInfo'

export default function useMaxOutputAmount(denomIn: string, denomOut: string, amount: BigNumber) {
  const { data: routeInfo } = useRouteInfo(denomIn, denomOut, amount)
  return useMemo(() => routeInfo?.amountOut ?? BN_ZERO, [routeInfo])
}
