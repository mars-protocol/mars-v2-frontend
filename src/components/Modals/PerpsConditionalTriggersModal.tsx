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
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { PercentageButtons } from 'components/perps/Module/PercentageButtons'
import { PerpsPriceHeader } from 'components/perps/Module/PerpsPriceHeader'

const perpsPercentage = (price: BigNumber, triggerPrice: BigNumber, isShort: boolean = false) => {
  if (!price || triggerPrice.isZero()) return BN_ZERO

  const normalizedTriggerPrice = triggerPrice.shiftedBy(-PRICE_ORACLE_DECIMALS)

  if (isShort) {
    return price.minus(normalizedTriggerPrice).dividedBy(price).multipliedBy(100)
  }

  return normalizedTriggerPrice.minus(price).dividedBy(price).multipliedBy(100)
}

const getTextColorClass = (percentage: BigNumber) => {
  if (percentage.isZero()) return 'text-white'
  if (percentage.isNegative()) return 'text-error'
  return 'text-success'
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

    useStore.setState({ perpsTradeDirection: tradeDirection })
  }, [modal, tradeDirection])

  const { stopLossError, takeProfitError } = usePriceValidation({
    currentPrice,
    currentTradeDirection: tradeDirection,
    showStopLoss: !stopLossPrice.isZero(),
    stopLossPrice,
    showTakeProfit: !takeProfitPrice.isZero(),
    takeProfitPrice,
  })

  const handleAddTriggers = useCallback(async () => {
    if (!currentAccount || !perpsAsset) return
    setIsLoading(true)
    try {
      const triggerOrders: { tp: string | null; sl: string | null } = {
        tp: null,
        sl: null,
      }

      if (!takeProfitPrice.isZero()) {
        triggerOrders.tp = takeProfitPrice.toString()
      }

      if (!stopLossPrice.isZero()) {
        triggerOrders.sl = stopLossPrice.toString()
      }

      useStore.setState({
        conditionalTriggerOrders: triggerOrders,
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
      <PerpsPriceHeader
        currentPrice={currentPrice}
        assetSymbol={assetSymbol}
        assetDecimals={perpsAsset?.perpsAsset.decimals ?? 0}
        assetPrice={perpsAsset?.perpsAsset.price?.amount}
      />
      <div className='flex flex-col gap-4 p-4'>
        <div className='flex flex-col gap-4'>
          <Text size='lg' className='text-left'>
            Take Profit{' '}
            <span className='ml-2 text-xs px-2 py-0.5 bg-white/10 rounded'>{assetSymbol}</span>
          </Text>
          <Text size='xs' className='text-left text-white/60'>
            {isShort ? 'Trigger when price falls to:' : 'Trigger when price rises to:'}
          </Text>
          {USD && (
            <div className='flex items-center gap-2'>
              <AssetAmountInput
                asset={{ ...USD, decimals: perpsAsset?.perpsAsset.decimals || 0 }}
                amount={takeProfitPrice}
                setAmount={setTakeProfitPrice}
                disabled={false}
                isUSD
              />
              <div className='flex flex-row flex-1 py-3 pl-3 pr-2 mt-2 border rounded border-white/20 bg-white/5'>
                <Text className={getTextColorClass(takeProfitPercentage)}>
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
          <Text size='xs' className='text-left text-white/60'>
            Position will close at this price, capturing any profits.
          </Text>
          <PercentageButtons
            currentPrice={currentPrice}
            setTargetPrice={setTakeProfitPrice}
            isShort={isShort}
            isTakeProfit={true}
          />
        </div>

        <div className='flex items-center w-full gap-4 my-2'>
          <div className='flex-1 h-px bg-white/10'></div>
          <Text size='sm' className='text-white/60 px-4'>
            AND / OR
          </Text>
          <div className='flex-1 h-px bg-white/10'></div>
        </div>

        <div className='flex flex-col gap-4'>
          <Text size='lg' className='text-left'>
            Stop Loss{' '}
            <span className='ml-2 text-xs px-2 py-0.5 bg-white/10 rounded'>{assetSymbol}</span>
          </Text>
          <Text size='xs' className='text-left text-white/60'>
            {isShort ? 'Trigger when price rises to:' : 'Trigger when price falls to:'}
          </Text>
          {USD && (
            <div className='flex items-center gap-2'>
              <AssetAmountInput
                asset={{ ...USD, decimals: perpsAsset?.perpsAsset.decimals || 0 }}
                amount={stopLossPrice}
                setAmount={setStopLossPrice}
                disabled={false}
                isUSD
              />
              <div className='flex flex-row flex-1 py-3 pl-3 pr-2 mt-2 border rounded border-white/20 bg-white/5'>
                <Text className={getTextColorClass(stopLossPercentage)}>
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
          <Text size='xs' className='text-left text-white/60'>
            Position will close at this price, limiting any losses.
          </Text>
          <PercentageButtons
            currentPrice={currentPrice}
            setTargetPrice={setStopLossPrice}
            isShort={isShort}
            isTakeProfit={false}
          />
        </div>

        <Callout type={CalloutType.INFO} iconClassName='self-start'>
          <Text size='sm' className='text-left'>
            The prices listed here are 'Spot Price Triggers,' which means they initiate your
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
              action.execute_perp_order.denom === perpsAsset.perpsAsset.denom &&
              action.execute_perp_order.reduce_only,
          )
        })}

        <Button
          onClick={handleAddTriggers}
          text='Add Triggers'
          color='primary'
          className='w-full mt-4'
          disabled={
            !!takeProfitError ||
            !!stopLossError ||
            (takeProfitPrice.isZero() && stopLossPrice.isZero()) ||
            isLoading
          }
          showProgressIndicator={isLoading}
        />
      </div>
    </Modal>
  )
}
