import React, { useCallback } from 'react'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'

interface PerpsTradeDirectionSelectorProps {
  isStopOrder: boolean
  tradeDirection: TradeDirection
  stopTradeDirection: TradeDirection
  onChangeTradeDirection: (newDirection: TradeDirection) => void
  onChangeStopTradeDirection: (newDirection: TradeDirection) => void
}

export default function PerpsTradeDirectionSelector({
  isStopOrder,
  tradeDirection,
  stopTradeDirection,
  onChangeTradeDirection,
  onChangeStopTradeDirection,
}: PerpsTradeDirectionSelectorProps) {
  const handleDirectionChange = useCallback(
    (newDirection: TradeDirection) => {
      if (isStopOrder) {
        onChangeStopTradeDirection(newDirection)
      } else {
        onChangeTradeDirection(newDirection)
      }
    },
    [isStopOrder, onChangeTradeDirection, onChangeStopTradeDirection],
  )

  return (
    <TradeDirectionSelector
      direction={isStopOrder ? stopTradeDirection : tradeDirection}
      onChangeDirection={handleDirectionChange}
    />
  )
}
