import { useEffect, useState } from 'react'
import { OrderType } from 'types/enums'
import { BN_ZERO } from 'constants/math'
import { BigNumber } from 'bignumber.js'

export const useOrderTypeManagement = (
  orderType: string,
  setLimitPrice: (price: BigNumber) => void,
  setStopPrice: (price: BigNumber) => void,
) => {
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(OrderType.MARKET)
  const isLimitOrder = selectedOrderType === OrderType.LIMIT
  const isStopOrder = selectedOrderType === OrderType.STOP

  useEffect(() => {
    if (!isStopOrder) {
      setStopPrice(BN_ZERO)
    }
  }, [isStopOrder, setStopPrice])

  useEffect(() => {
    if (!isLimitOrder) {
      setLimitPrice(BN_ZERO)
    }
  }, [isLimitOrder, setLimitPrice])

  useEffect(() => {
    if (orderType === 'limit') {
      setSelectedOrderType(OrderType.LIMIT)
    }
    if (orderType === 'stop') {
      setSelectedOrderType(OrderType.STOP)
    }
  }, [orderType])

  return {
    selectedOrderType,
    setSelectedOrderType,
    isLimitOrder,
    isStopOrder,
  }
}
