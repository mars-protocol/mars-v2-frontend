import { useMemo, useState } from 'react'
import { OrderType } from 'types/enums'
import { BN_ZERO } from 'constants/math'
import { BigNumber } from 'bignumber.js'

export const useOrderTypeManagement = (
  orderType: string,
  setLimitPrice: (price: BigNumber) => void,
  setStopPrice: (price: BigNumber) => void,
) => {
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)

  useMemo(() => {
    if (orderType === 'limit') {
      setSelectedOrderType(OrderType.LIMIT)
    } else if (orderType === 'stop') {
      setSelectedOrderType(OrderType.STOP)
    }

    if (selectedOrderType !== OrderType.STOP) {
      setStopPrice(BN_ZERO)
    }
    if (selectedOrderType !== OrderType.LIMIT) {
      setLimitPrice(BN_ZERO)
    }
  }, [orderType, selectedOrderType, setLimitPrice, setStopPrice])

  const isLimitOrder = selectedOrderType === OrderType.LIMIT
  const isStopOrder = selectedOrderType === OrderType.STOP

  return {
    selectedOrderType,
    setSelectedOrderType,
    isLimitOrder,
    isStopOrder,
  }
}
