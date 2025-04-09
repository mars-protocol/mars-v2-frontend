import Modal from 'components/Modals/Modal'
import AssetAmountInput from 'components/common/AssetAmountInput'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import usePriceValidation from 'hooks/perps/usePriceValidation'
import usePrice from 'hooks/prices/usePrice'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { formatPercent } from 'utils/formatters'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import BigNumber from 'bignumber.js'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

const perpsPercentage = (price: BigNumber, triggerPrice: BigNumber) => {
  if (!price || triggerPrice.isZero()) return BN_ZERO
  return triggerPrice.minus(price).dividedBy(price).multipliedBy(100)
}

export default function PerpsConditionalTriggersModal() {
  const perpsAsset = usePerpsAsset()
  const modal = useStore((s) => s.conditionalTriggersModal)

  const [takeProfitPrice, setTakeProfitPrice] = useState(BN_ZERO)
  const [stopLossPrice, setStopLossPrice] = useState(BN_ZERO)
  const [isLoading, setIsLoading] = useState(false)

  const { data: allAssets } = useAssets()
  const USD = allAssets.find(byDenom('usd'))

  const currentAccount = useCurrentAccount()
  const { data: limitOrders } = usePerpsLimitOrders()
  const currentPrice = usePrice(perpsAsset?.perpsAsset.denom ?? '')

  const stopLossPercentage = useMemo(
    () => perpsPercentage(currentPrice, stopLossPrice),
    [currentPrice, stopLossPrice],
  )
  const takeProfitPercentage = useMemo(
    () => perpsPercentage(currentPrice, takeProfitPrice),
    [currentPrice, takeProfitPrice],
  )

  const onClose = useCallback(() => {
    useStore.setState({ conditionalTriggersModal: false })
  }, [])

  const currentTradeDirection = useMemo(() => {
    return (
      currentAccount?.perps.find((p) => p.denom === perpsAsset?.perpsAsset.denom)?.tradeDirection ||
      'long'
    )
  }, [currentAccount, perpsAsset])

  useEffect(() => {
    setTakeProfitPrice(BN_ZERO)
    setStopLossPrice(BN_ZERO)
  }, [modal])

  const { isValid, stopLossError, takeProfitError } = usePriceValidation({
    currentPrice,
    currentTradeDirection,
    showStopLoss: true,
    stopLossPrice,
    showTakeProfit: true,
    takeProfitPrice,
  })

  const handleAddTriggers = useCallback(async () => {
    if (!currentAccount || !perpsAsset) return
    setIsLoading(true)
    try {
      useStore.setState({
        conditionalTriggerOrders: {
          tp: takeProfitPrice.toString(),
          sl: stopLossPrice.toString(),
        },
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }, [currentAccount, perpsAsset, stopLossPrice, takeProfitPrice, onClose])

  if (!modal) return null

  return (
    <Modal
      onClose={onClose}
      header='Conditional Triggers'
      headerClassName='gradient-header px-4 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
      modalClassName='md:max-w-modal-xs'
    >
      <div className='flex flex-col gap-4 p-4'>
        <div className='flex flex-col gap-4'>
          <Text size='lg' className='text-left'>
            Take Profit
          </Text>
          {USD && (
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
          )}
          {takeProfitError && (
            <Callout type={CalloutType.WARNING} className='mt-2 text-left'>
              {takeProfitError}
            </Callout>
          )}
        </div>

        <div className='flex flex-col gap-4'>
          <Text size='lg' className='text-left'>
            Stop Loss
          </Text>
          {USD && (
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
          )}
          {stopLossError && (
            <Callout type={CalloutType.WARNING} className='mt-2 text-left'>
              {stopLossError}
            </Callout>
          )}
        </div>

        <Callout type={CalloutType.INFO} iconClassName='self-start'>
          <Text size='sm' className='text-left'>
            The prices listed here are 'Spot Price Triggers', which means they initiate your
            transaction. The actual 'Fill Price' at which your transaction is completed may vary due
            to the Funding Rate.
          </Text>
        </Callout>

        {limitOrders?.some((order) => {
          const actions = order.order.actions
          return actions.some(
            (action) =>
              'execute_perp_order' in action &&
              action.execute_perp_order.denom === perpsAsset.perpsAsset.denom &&
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
          onClick={handleAddTriggers}
          text='Add Triggers'
          color='tertiary'
          className='w-full mt-4'
          disabled={!isValid || isLoading}
          showProgressIndicator={isLoading}
        />
      </div>
    </Modal>
  )
}
