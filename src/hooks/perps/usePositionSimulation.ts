import { useMemo } from 'react'
import getPerpsPosition from 'utils/getPerpsPosition'

export const usePositionSimulation = ({
  tradingFee,
  perpsVault,
  perpsVaultModal,
  isLimitOrder,
  isStopOrder,
  currentPerpPosition,
  amount,
  perpsAsset,
  limitPrice,
  simulatePerps,
}: {
  tradingFee?: {
    baseDenom: string
    price: BigNumber
    fee: { opening: BigNumber; closing: BigNumber }
  }

  perpsVault?: PerpsVault
  perpsVaultModal: PerpsVaultModal | null
  isLimitOrder: boolean
  isStopOrder: boolean
  currentPerpPosition?: PerpsPosition
  amount: BigNumber
  perpsAsset: Asset
  limitPrice: BigNumber
  isAutoLendEnabledForCurrentAccount: boolean
  simulatePerps: (newPosition: PerpsPosition) => void
}) => {
  useMemo(() => {
    if (!tradingFee || !perpsVault || perpsVaultModal) return
    if (isLimitOrder || isStopOrder) return

    const newAmount = currentPerpPosition?.amount.plus(amount) ?? amount
    const previousTradeDirection = currentPerpPosition?.amount.isLessThan(0) ? 'short' : 'long'
    const newTradeDirection = newAmount.isLessThan(0) ? 'short' : 'long'
    const updatedTradeDirection = newAmount.isZero() ? previousTradeDirection : newTradeDirection

    const newPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      newAmount,
      updatedTradeDirection,
      tradingFee,
      currentPerpPosition,
      limitPrice,
    )
    simulatePerps(newPosition)
  }, [
    amount,
    currentPerpPosition,
    isLimitOrder,
    isStopOrder,
    limitPrice,
    perpsAsset,
    perpsVault,
    perpsVaultModal,
    simulatePerps,
    tradingFee,
  ])
}
