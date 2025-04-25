import Modal from 'components/Modals/Modal'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Text from 'components/common/Text'
import Divider from 'components/common/Divider'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import usePriceValidation from 'hooks/perps/usePriceValidation'
import usePrice from 'hooks/prices/usePrice'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'
import BigNumber from 'bignumber.js'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import { PerpsPriceHeader } from 'components/perps/Module/PerpsPriceHeader'
import { TriggerSection } from 'components/perps/Module/TriggerSection'
import useChildOrders from 'hooks/perps/useChildOrders'

const perpsPercentage = (price: BigNumber, triggerPrice: BigNumber, isShort: boolean = false) => {
  if (!price || triggerPrice.isZero()) return BN_ZERO

  const normalizedTriggerPrice = triggerPrice.shiftedBy(-PRICE_ORACLE_DECIMALS)

  if (isShort) {
    return price.minus(normalizedTriggerPrice).dividedBy(price).multipliedBy(100)
  }

  return normalizedTriggerPrice.minus(price).dividedBy(price).multipliedBy(100)
}

export default function PerpsConditionalTriggersModal() {
  const perpsAsset = usePerpsAsset()
  const modal = useStore((s) => s.conditionalTriggersModal)

  const [takeProfitPrice, setTakeProfitPrice] = useState(BN_ZERO)
  const [stopLossPrice, setStopLossPrice] = useState(BN_ZERO)
  const [showTakeProfit, setShowTakeProfit] = useState(true)
  const [showStopLoss, setShowStopLoss] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const { data: allAssets } = useAssets()
  const USD = allAssets.find(byDenom('usd'))

  const currentAccount = useCurrentAccount()
  const { data: limitOrders } = usePerpsLimitOrders()
  const currentPrice = usePrice(perpsAsset?.perpsAsset.denom ?? '')
  const { hasChildOrders } = useChildOrders()

  const tradeDirection = useStore((s) => s.perpsTradeDirection)
  const isShort = tradeDirection === 'short'

  const stopLossPercentage = useMemo(
    () => perpsPercentage(currentPrice, stopLossPrice, isShort),
    [currentPrice, stopLossPrice, isShort],
  )

  const takeProfitPercentage = useMemo(
    () => perpsPercentage(currentPrice, takeProfitPrice, isShort),
    [currentPrice, takeProfitPrice, isShort],
  )

  const onClose = useCallback(() => {
    useStore.setState({ conditionalTriggersModal: false })
  }, [])

  const assetSymbol = useMemo(
    () => perpsAsset?.perpsAsset.symbol || perpsAsset?.perpsAsset.denom || '',
    [perpsAsset],
  )

  useEffect(() => {
    setTakeProfitPrice(BN_ZERO)
    setStopLossPrice(BN_ZERO)
    setShowTakeProfit(true)
    setShowStopLoss(true)

    useStore.setState({ perpsTradeDirection: tradeDirection })
  }, [modal, tradeDirection])

  const { stopLossError, takeProfitError } = usePriceValidation({
    currentPrice,
    currentTradeDirection: tradeDirection,
    showStopLoss: showStopLoss && !stopLossPrice.isZero(),
    stopLossPrice,
    showTakeProfit: showTakeProfit && !takeProfitPrice.isZero(),
    takeProfitPrice,
  })

  const handleRemoveTakeProfit = useCallback(() => {
    setShowTakeProfit(false)
    setTakeProfitPrice(BN_ZERO)
  }, [])

  const handleRemoveStopLoss = useCallback(() => {
    setShowStopLoss(false)
    setStopLossPrice(BN_ZERO)
  }, [])

  const handleAddTriggers = useCallback(async () => {
    if (!currentAccount || !perpsAsset) return
    setIsLoading(true)
    try {
      const triggerOrders: { tp: string | null; sl: string | null } = {
        tp: null,
        sl: null,
      }

      if (showTakeProfit && !takeProfitPrice.isZero()) {
        triggerOrders.tp = takeProfitPrice.toString()
      }

      if (showStopLoss && !stopLossPrice.isZero()) {
        triggerOrders.sl = stopLossPrice.toString()
      }

      useStore.setState({
        conditionalTriggerOrders: triggerOrders,
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }, [
    currentAccount,
    perpsAsset,
    stopLossPrice,
    takeProfitPrice,
    showStopLoss,
    showTakeProfit,
    onClose,
  ])

  if (!modal) return null

  return (
    <Modal
      onClose={onClose}
      header='Conditional Triggers'
      headerClassName='gradient-header px-4 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
      modalClassName='md:max-w-modal-xs'
    >
      <PerpsPriceHeader
        currentPrice={currentPrice}
        assetSymbol={assetSymbol}
        assetDecimals={perpsAsset?.perpsAsset.decimals ?? 0}
      />
      <div className='flex flex-col gap-4 p-4'>
        <TriggerSection
          title='Take Profit'
          assetSymbol={assetSymbol}
          triggerDescription={
            isShort ? 'Trigger when price falls to:' : 'Trigger when price rises to:'
          }
          infoText={`If ${assetSymbol} ${isShort ? 'falls' : 'rises'} to your specified price, your position will be closed to capture profits.`}
          currentPrice={currentPrice}
          triggerPrice={takeProfitPrice}
          setTriggerPrice={setTakeProfitPrice}
          triggerPercentage={takeProfitPercentage}
          error={takeProfitError}
          asset={USD ? { ...USD, decimals: perpsAsset?.perpsAsset.decimals || 0 } : undefined}
          isShort={isShort}
          isTakeProfit={true}
          showTrigger={showTakeProfit}
          setShowTrigger={setShowTakeProfit}
          handleRemoveTrigger={handleRemoveTakeProfit}
          hasChildOrders={hasChildOrders(limitOrders, perpsAsset?.perpsAsset.denom)}
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
          assetSymbol={assetSymbol}
          triggerDescription={
            isShort ? 'Trigger when price rises to:' : 'Trigger when price falls to:'
          }
          infoText={`If ${assetSymbol} ${isShort ? 'rises' : 'falls'} to your specified price, your position will be closed to limit losses.`}
          currentPrice={currentPrice}
          triggerPrice={stopLossPrice}
          setTriggerPrice={setStopLossPrice}
          triggerPercentage={stopLossPercentage}
          error={stopLossError}
          asset={USD ? { ...USD, decimals: perpsAsset?.perpsAsset.decimals || 0 } : undefined}
          isShort={isShort}
          isTakeProfit={false}
          showTrigger={showStopLoss}
          setShowTrigger={setShowStopLoss}
          handleRemoveTrigger={handleRemoveStopLoss}
          hasChildOrders={hasChildOrders(limitOrders, perpsAsset?.perpsAsset.denom)}
        />

        <Callout type={CalloutType.INFO} iconClassName='self-start'>
          <Text size='sm' className='text-left'>
            The prices listed here are 'Spot Price Triggers,' which means they initiate your
            transaction. The actual 'Fill Price' at which your transaction is completed may vary due
            to the Funding Rate. This could result in a better fill price if the funding rate is
            favorable, or a less advantageous price if it is not. Always consider the potential
            impact of the funding rate on the final price.
          </Text>
        </Callout>

        {hasChildOrders(limitOrders, perpsAsset?.perpsAsset.denom) && (
          <Callout type={CalloutType.WARNING} iconClassName='self-start'>
            <Text size='sm'>
              Your existing TP/SL triggers will be removed if you add new triggers on this order.
            </Text>
          </Callout>
        )}

        <Button
          onClick={handleAddTriggers}
          text='Add Triggers'
          color='primary'
          className='w-full mt-4'
          disabled={
            (showTakeProfit && !!takeProfitError) ||
            (showStopLoss && !!stopLossError) ||
            (!showTakeProfit && !showStopLoss) ||
            (showTakeProfit &&
              takeProfitPrice.isZero() &&
              showStopLoss &&
              stopLossPrice.isZero()) ||
            isLoading
          }
          showProgressIndicator={isLoading}
        />
      </div>
    </Modal>
  )
}
