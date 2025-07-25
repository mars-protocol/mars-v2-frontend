import BigNumber from 'bignumber.js'
import Modal from 'components/Modals/Modal'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import { PerpsPriceHeader } from 'components/perps/Module/PerpsPriceHeader'
import { TriggerSection } from 'components/perps/Module/TriggerSection'
import USD from 'constants/USDollar'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChildOrders from 'hooks/perps/useChildOrders'
import { useKeeperFee } from 'hooks/perps/useKeeperFee'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import usePriceValidation from 'hooks/perps/usePriceValidation'
import { useSubmitLimitOrder } from 'hooks/perps/useSubmitLimitOrder'
import usePrice from 'hooks/prices/usePrice'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'

const perpsPercentage = (price: BigNumber, triggerPrice: BigNumber, isShort: boolean = false) => {
  if (!price || triggerPrice.isZero()) return BN_ZERO

  const normalizedTriggerPrice = triggerPrice.shiftedBy(-PRICE_ORACLE_DECIMALS)

  if (isShort) {
    return price.minus(normalizedTriggerPrice).dividedBy(price).multipliedBy(100)
  }

  return normalizedTriggerPrice.minus(price).dividedBy(price).multipliedBy(100)
}

export default function PerpsSlTpModal() {
  const modal = useStore((s) => s.addSLTPModal)
  const perpsAsset = modal && 'parentPosition' in modal ? modal.parentPosition?.asset : undefined

  useEffect(() => {
    setStopLossPrice(BN_ZERO)
    setTakeProfitPrice(BN_ZERO)
    setShowStopLoss(false)
    setShowTakeProfit(false)
  }, [modal])

  const [stopLossPrice, setStopLossPrice] = useState(BN_ZERO)
  const [takeProfitPrice, setTakeProfitPrice] = useState(BN_ZERO)
  const [showStopLoss, setShowStopLoss] = useState(false)
  const [showTakeProfit, setShowTakeProfit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const submitLimitOrder = useSubmitLimitOrder()
  const currentAccount = useCurrentAccount()
  const { data: limitOrders } = usePerpsLimitOrders()
  const { hasChildOrders } = useChildOrders()

  const { data: perpsConfig } = usePerpsConfig()
  const assets = useDepositEnabledAssets()
  const currentPrice = usePrice(perpsAsset?.denom ?? '')
  const { calculateKeeperFee } = useKeeperFee()

  const assetName = useMemo(() => perpsAsset?.symbol || 'the asset', [perpsAsset])

  const currentTradeDirection = useMemo(() => {
    if (modal && 'parentPosition' in modal) {
      return modal.parentPosition?.tradeDirection ?? 'long'
    }
    return (
      currentAccount?.perps.find((p) => p.denom === perpsAsset?.denom)?.tradeDirection ?? 'long'
    )
  }, [currentAccount, perpsAsset, modal])

  const isShort = useMemo(() => currentTradeDirection === 'short', [currentTradeDirection])

  const stopLossPercentage = useMemo(
    () => perpsPercentage(currentPrice, stopLossPrice, isShort),
    [currentPrice, stopLossPrice, isShort],
  )

  const takeProfitPercentage = useMemo(
    () => perpsPercentage(currentPrice, takeProfitPrice, isShort),
    [currentPrice, takeProfitPrice, isShort],
  )

  const feeToken = useMemo(
    () => assets.find(byDenom(perpsConfig?.base_denom ?? '')),
    [assets, perpsConfig?.base_denom],
  )

  const onClose = useCallback(() => {
    useStore.setState({ addSLTPModal: false })
  }, [])

  const positionSize = useMemo(() => {
    if (modal && 'parentPosition' in modal) {
      return modal.parentPosition?.amount ?? BN_ZERO
    }
    return currentAccount?.perps.find((p) => p.denom === perpsAsset?.denom)?.amount ?? BN_ZERO
  }, [currentAccount, perpsAsset, modal])

  const { isValid, stopLossError, takeProfitError } = usePriceValidation({
    currentPrice,
    currentTradeDirection,
    showStopLoss,
    stopLossPrice,
    showTakeProfit,
    takeProfitPrice,
  })

  const createStopLossOrder = useCallback(() => {
    if (!showStopLoss || stopLossPrice.isZero() || !perpsAsset || !feeToken) return null
    const isShort = currentTradeDirection === 'short'

    return {
      asset: perpsAsset,
      orderSize: positionSize.negated(),
      limitPrice: stopLossPrice.shiftedBy(-PRICE_ORACLE_DECIMALS),
      tradeDirection: isShort ? 'long' : ('short' as TradeDirection),
      comparison: isShort ? 'greater_than' : ('less_than' as TriggerType),
      baseDenom: feeToken.denom,
      keeperFee: calculateKeeperFee,
      reduceOnly: true,
    }
  }, [
    showStopLoss,
    stopLossPrice,
    perpsAsset,
    feeToken,
    currentTradeDirection,
    positionSize,
    calculateKeeperFee,
  ])

  const createTakeProfitOrder = useCallback(() => {
    if (!showTakeProfit || takeProfitPrice.isZero() || !perpsAsset || !feeToken) return null
    const isShort = currentTradeDirection === 'short'

    return {
      asset: perpsAsset,
      orderSize: positionSize.negated(),
      limitPrice: takeProfitPrice.shiftedBy(-PRICE_ORACLE_DECIMALS),
      tradeDirection: isShort ? 'long' : ('short' as TradeDirection),
      comparison: isShort ? 'less_than' : ('greater_than' as TriggerType),
      baseDenom: feeToken.denom,
      keeperFee: calculateKeeperFee,
      reduceOnly: true,
    }
  }, [
    showTakeProfit,
    takeProfitPrice,
    perpsAsset,
    feeToken,
    currentTradeDirection,
    positionSize,
    calculateKeeperFee,
  ])

  const filterExistingOrders = useCallback(() => {
    if (!limitOrders) return []

    const matchingOrders = []

    for (const order of limitOrders) {
      const hasPerpOrder = order.order.actions.some(
        (action) =>
          'execute_perp_order' in action &&
          action.execute_perp_order.denom === perpsAsset?.denom &&
          action.execute_perp_order.reduce_only,
      )

      if (!hasPerpOrder) continue

      const triggerCondition = order.order.conditions.find(
        (condition) => 'trigger_order_executed' in condition,
      )

      const isChildOrder = triggerCondition && 'trigger_order_executed' in triggerCondition

      if (!isChildOrder) {
        matchingOrders.push(order)
        continue
      }

      const triggerOrderId = triggerCondition.trigger_order_executed.trigger_order_id
      const triggerOrderExists = limitOrders.some(
        (order) => order.order.order_id === triggerOrderId,
      )

      if (!triggerOrderExists) {
        matchingOrders.push(order)
      }
    }

    return matchingOrders
  }, [limitOrders, perpsAsset])

  const handleDone = useCallback(async () => {
    if (!currentAccount || !perpsAsset || !feeToken) return
    setIsLoading(true)
    onClose()
    try {
      const existingOrders = filterExistingOrders()

      const stopLossOrder = createStopLossOrder()
      const takeProfitOrder = createTakeProfitOrder()

      const orders = [stopLossOrder, takeProfitOrder].filter(
        (order): order is NonNullable<typeof order> => order !== null,
      )

      if (orders.length > 0) {
        await submitLimitOrder({
          orders,
          cancelOrders: existingOrders.map((order) => ({ orderId: order.order.order_id })),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    currentAccount,
    perpsAsset,
    feeToken,
    filterExistingOrders,
    createStopLossOrder,
    createTakeProfitOrder,
    submitLimitOrder,
    onClose,
  ])

  const handleRemoveStopLoss = () => {
    setShowStopLoss(false)
    setStopLossPrice(BN_ZERO)
  }

  const handleRemoveTakeProfit = () => {
    setShowTakeProfit(false)
    setTakeProfitPrice(BN_ZERO)
  }

  if (!modal) return null

  return (
    <Modal
      onClose={onClose}
      header='Add Stop Loss / Take Profit Orders'
      headerClassName='gradient-header px-4 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
      modalClassName='md:max-w-modal-xs'
    >
      <PerpsPriceHeader
        currentPrice={currentPrice}
        assetSymbol={assetName}
        assetDecimals={perpsAsset?.decimals ?? 0}
      />
      <div className='flex flex-col gap-4 p-4'>
        <TriggerSection
          title='Take Profit'
          assetSymbol={assetName}
          triggerDescription={
            isShort ? 'Trigger when price falls to:' : 'Trigger when price rises to:'
          }
          infoText={
            isShort
              ? `If ${assetName} falls to your specified price, your position will be closed to capture profits.`
              : `If ${assetName} rises to your specified price, your position will be closed to capture profits.`
          }
          currentPrice={currentPrice}
          triggerPrice={takeProfitPrice}
          setTriggerPrice={setTakeProfitPrice}
          triggerPercentage={takeProfitPercentage}
          error={takeProfitError}
          asset={perpsAsset ? { ...USD, decimals: perpsAsset?.decimals ?? 0 } : undefined}
          isShort={isShort}
          isTakeProfit={true}
          showTrigger={showTakeProfit}
          setShowTrigger={setShowTakeProfit}
          handleRemoveTrigger={handleRemoveTakeProfit}
          hasChildOrders={hasChildOrders(limitOrders, perpsAsset?.denom)}
        />

        <div className='flex items-center w-full gap-2'>
          <Divider className='w-full' />
          <Text size='sm' className='w-full px-2 text-center text-white/60'>
            AND / OR
          </Text>
          <Divider className='w-full' />
        </div>

        <TriggerSection
          title='Stop Loss'
          assetSymbol={assetName}
          triggerDescription={
            isShort ? 'Trigger when price rises to:' : 'Trigger when price falls to:'
          }
          infoText={
            isShort
              ? `If ${assetName} rises to your specified price, your position will be closed to limit losses.`
              : `If ${assetName} falls to your specified price, your position will be closed to limit losses.`
          }
          currentPrice={currentPrice}
          triggerPrice={stopLossPrice}
          setTriggerPrice={setStopLossPrice}
          triggerPercentage={stopLossPercentage}
          error={stopLossError}
          asset={perpsAsset ? { ...USD, decimals: perpsAsset?.decimals ?? 0 } : undefined}
          isShort={isShort}
          isTakeProfit={false}
          showTrigger={showStopLoss}
          setShowTrigger={setShowStopLoss}
          handleRemoveTrigger={handleRemoveStopLoss}
          hasChildOrders={hasChildOrders(limitOrders, perpsAsset?.denom)}
        />

        <Callout type={CalloutType.INFO} iconClassName='self-start'>
          <Text size='sm'>
            The prices listed here are 'Spot Price Triggers', which means they initiate your
            transaction. The actual 'Fill Price' at which your transaction is completed may vary due
            to the Funding Rate.
          </Text>
          {currentTradeDirection === 'long' ? (
            <Text size='sm'>
              This could result in a better fill price if the funding rate is favorable, or a less
              advantageous price if it is not.
            </Text>
          ) : (
            <Text size='sm'>
              For short positions, a positive funding rate may result in a better fill price, while
              a negative funding rate may result in a less advantageous price.
            </Text>
          )}
          <Text size='sm'>
            Always consider the potential impact of the funding rate on the final price.
          </Text>
        </Callout>
        {hasChildOrders(limitOrders, perpsAsset?.denom) && (
          <Callout type={CalloutType.WARNING} iconClassName='self-start'>
            <Text size='sm'>
              Your existing TP/SL triggers will be removed if you add a new TP/SL trigger on this
              order.
            </Text>
          </Callout>
        )}
        <Button
          onClick={handleDone}
          text='Done'
          color='tertiary'
          className='w-full mt-4'
          disabled={!isValid || isLoading}
          showProgressIndicator={isLoading}
        />
      </div>
    </Modal>
  )
}
