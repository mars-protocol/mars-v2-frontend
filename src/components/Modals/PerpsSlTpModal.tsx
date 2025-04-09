import Modal from 'components/Modals/Modal'
import AssetAmountInput from 'components/common/AssetAmountInput'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Divider from 'components/common/Divider'
import { TrashBin } from 'components/common/Icons'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import usePriceValidation from 'hooks/perps/usePriceValidation'
import { useSubmitLimitOrder } from 'hooks/perps/useSubmitLimitOrder'
import usePrice from 'hooks/prices/usePrice'
import useKeeperFee from 'hooks/perps/useKeeperFee'
import { useCallback, useMemo, useState } from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { formatPercent } from 'utils/formatters'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import useAutoLend from 'hooks/wallet/useAutoLend'

const perpsPercentage = (price: BigNumber, triggerPrice: BigNumber) => {
  if (!price || triggerPrice.isZero()) return BN_ZERO
  return triggerPrice.minus(price).dividedBy(price).multipliedBy(100)
}

export default function PerpsSlTpModal({ parentPosition }: { parentPosition: PerpPositionRow }) {
  const perpsAsset = parentPosition?.asset

  const modal = useStore((s) => s.addSLTPModal)

  const [stopLossPrice, setStopLossPrice] = useState(BN_ZERO)
  const [takeProfitPrice, setTakeProfitPrice] = useState(BN_ZERO)
  const [showStopLoss, setShowStopLoss] = useState(false)
  const [showTakeProfit, setShowTakeProfit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { data: allAssets } = useAssets()
  const USD = allAssets.find(byDenom('usd'))

  const submitLimitOrder = useSubmitLimitOrder()
  const currentAccount = useCurrentAccount()
  const { data: limitOrders } = usePerpsLimitOrders()
  const cancelTriggerOrder = useStore((s) => s.cancelTriggerOrder)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()

  const { data: perpsConfig } = usePerpsConfig()
  const assets = useDepositEnabledAssets()
  const currentPrice = usePrice(perpsAsset?.denom ?? '')
  const { calculateKeeperFee } = useKeeperFee()

  const assetName = useMemo(() => perpsAsset?.symbol || 'the asset', [perpsAsset])

  const stopLossPercentage = useMemo(
    () => perpsPercentage(currentPrice, stopLossPrice),
    [currentPrice, stopLossPrice],
  )
  const takeProfitPercentage = useMemo(
    () => perpsPercentage(currentPrice, takeProfitPrice),
    [currentPrice, takeProfitPrice],
  )

  const feeToken = useMemo(
    () => assets.find(byDenom(perpsConfig?.base_denom ?? '')),
    [assets, perpsConfig?.base_denom],
  )

  const onClose = useCallback(() => {
    useStore.setState({ addSLTPModal: false })
  }, [])

  const currentTradeDirection = useMemo(() => {
    return (
      currentAccount?.perps.find((p) => p.denom === perpsAsset?.denom)?.tradeDirection || 'long'
    )
  }, [currentAccount, perpsAsset])

  const positionSize = useMemo(() => {
    return currentAccount?.perps.find((p) => p.denom === perpsAsset?.denom)?.amount ?? BN_ZERO
  }, [currentAccount, perpsAsset])

  const { isValid, stopLossError, takeProfitError } = usePriceValidation({
    currentPrice,
    currentTradeDirection,
    showStopLoss,
    stopLossPrice,
    showTakeProfit,
    takeProfitPrice,
  })

  const handleDone = useCallback(async () => {
    if (!currentAccount || !perpsAsset || !feeToken) return
    setIsLoading(true)
    try {
      const isShort = currentTradeDirection === 'short'

      // Find existing SL/TP orders for this position
      const existingOrders =
        limitOrders?.filter((order) => {
          const actions = order.order.actions
          return actions.some(
            (action) =>
              'execute_perp_order' in action &&
              action.execute_perp_order.denom === perpsAsset.denom &&
              action.execute_perp_order.reduce_only,
          )
        }) ?? []

      const createStopLossOrder = () => {
        if (!showStopLoss || stopLossPrice.isZero()) return null

        return {
          asset: perpsAsset,
          orderSize: isShort ? positionSize : positionSize.negated(),
          limitPrice: stopLossPrice,
          tradeDirection: isShort ? 'short' : ('long' as TradeDirection),
          comparison: isShort ? 'greater_than' : ('less_than' as TriggerType),
          baseDenom: feeToken.denom,
          keeperFee: calculateKeeperFee,
          reduceOnly: true,
        }
      }

      const createTakeProfitOrder = () => {
        if (!showTakeProfit || takeProfitPrice.isZero()) return null

        return {
          asset: perpsAsset,
          orderSize: isShort ? positionSize : positionSize.negated(),
          limitPrice: takeProfitPrice,
          tradeDirection: isShort ? 'short' : ('long' as TradeDirection),
          comparison: isShort ? 'less_than' : ('greater_than' as TriggerType),
          baseDenom: feeToken.denom,
          keeperFee: calculateKeeperFee,
          reduceOnly: true,
        }
      }

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

      onClose()
    } finally {
      setIsLoading(false)
    }
  }, [
    currentAccount,
    perpsAsset,
    feeToken,
    showStopLoss,
    stopLossPrice,
    showTakeProfit,
    takeProfitPrice,
    calculateKeeperFee,
    submitLimitOrder,
    onClose,
    currentTradeDirection,
    positionSize,
    limitOrders,
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
      header='Triggers'
      headerClassName='gradient-header px-4 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
      modalClassName='md:max-w-modal-xs'
    >
      <div className='flex flex-col gap-4 p-4'>
        {showStopLoss && USD && (
          <>
            <Text size='lg' className='text-left'>
              Stop Loss
            </Text>
            <div className='flex items-center gap-2'>
              <AssetAmountInput
                asset={{ ...USD, decimals: 0 }}
                amount={stopLossPrice}
                setAmount={setStopLossPrice}
                disabled={false}
                isUSD
              />
              <div className='flex flex-row flex-1 py-3 pl-3 pr-2 mt-2 border rounded border-white/20 bg-white/5'>
                <Text
                  className={
                    stopLossPercentage.isZero()
                      ? 'text-white'
                      : stopLossPercentage.isNegative()
                        ? 'text-error'
                        : 'text-success'
                  }
                >
                  {formatPercent(stopLossPercentage.toNumber())}
                </Text>
              </div>
            </div>
            {stopLossError && (
              <Callout type={CalloutType.WARNING} className='mt-2 text-left'>
                {stopLossError}
              </Callout>
            )}
            <Button
              onClick={handleRemoveStopLoss}
              text='Remove trigger'
              color='secondary'
              leftIcon={<TrashBin className='self-center w-4 h-4 text-error' />}
              variant='transparent'
              textClassNames='text-error items-center'
              className='items-center self-start text-sm'
            />
          </>
        )}
        {!showStopLoss && (
          <Button
            onClick={() => setShowStopLoss(true)}
            text='Add Stop Loss Trigger'
            color='tertiary'
            className='w-full'
          />
        )}
        <Text size='sm' className='text-left text-white/60'>
          {`If ${assetName} falls to your specified price, a market sell will be triggered to prevent any further losses.`}
        </Text>
        <div className='flex items-center w-full gap-2'>
          <Divider className='w-full' />
          <Text size='sm' className='w-full px-2 text-center text-white/60'>
            AND / OR
          </Text>
          <Divider className='w-full' />
        </div>
        {showTakeProfit && USD && (
          <>
            <Text size='lg' className='text-left'>
              Take Profit
            </Text>
            <div className='flex items-center gap-2'>
              <AssetAmountInput
                asset={{ ...USD, decimals: 0 }}
                amount={takeProfitPrice}
                setAmount={setTakeProfitPrice}
                disabled={false}
                isUSD
              />
              <div className='flex flex-row flex-1 py-3 pl-3 pr-2 mt-2 border rounded border-white/20 bg-white/5'>
                <Text
                  className={
                    takeProfitPercentage.isZero()
                      ? 'text-white'
                      : takeProfitPercentage.isNegative()
                        ? 'text-error'
                        : 'text-success'
                  }
                >
                  {formatPercent(takeProfitPercentage.toNumber())}
                </Text>
              </div>
            </div>
            {takeProfitError && (
              <Callout type={CalloutType.WARNING} className='mt-2 text-left'>
                {takeProfitError}
              </Callout>
            )}
            <Button
              onClick={handleRemoveTakeProfit}
              text='Remove trigger'
              color='secondary'
              leftIcon={<TrashBin className='self-center w-4 h-4 text-error' />}
              variant='solid'
              textClassNames='text-error items-center'
              className='items-center self-start text-sm'
            />
          </>
        )}
        {!showTakeProfit && (
          <Button
            onClick={() => setShowTakeProfit(true)}
            text='Add Take Profit Trigger'
            color='tertiary'
            className='w-full'
          />
        )}
        <Text size='sm' className='text-left text-white/60'>
          {`If ${assetName} increases to your specified price, a market sell will be triggered to capture any
          profits.`}
        </Text>
        <Divider />
        <Callout type={CalloutType.INFO} iconClassName='self-start'>
          <Text size='sm' className='text-left'>
            The prices listed here are 'Spot Price Triggers', which means they initiate your
            transaction. The actual 'Fill Price' at which your transaction is completed may vary due
            to the Funding Rate. This could result in a better fill price if the funding rate is
            favorable, or a less advantageous price if it is not. Always consider the potential
            impact of the funding rate on the final price.
          </Text>
        </Callout>
        {limitOrders?.some((order) => {
          const actions = order.order.actions
          return actions.some(
            (action) =>
              'execute_perp_order' in action &&
              action.execute_perp_order.denom === perpsAsset?.denom &&
              action.execute_perp_order.reduce_only,
          )
        }) && (
          <Callout type={CalloutType.WARNING} iconClassName='self-start'>
            <Text size='sm' className='text-left'>
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
