import { ReactNode, useEffect, useState } from 'react'
import Modal from 'components/Modals/Modal'
import Text from 'components/common/Text'
import useStore from 'store'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import { BN } from 'utils/helpers'
import { demagnify } from 'utils/formatters'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import { byDenom } from 'utils/array'
import {
  Action,
  Condition,
  TriggerOrderResponse,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface OrderCardProps {
  title: string
  subtitle?: string
  rows: Record<string, { label: string; value: string | ReactNode; valueColor?: string }>
  headerColor?: string
}

interface OraclePriceCondition {
  oracle_price: {
    comparison: string
    denom: string
    price: string
  }
}

const OrderCard = ({ title, subtitle, rows, headerColor = 'text-amber-500' }: OrderCardProps) => (
  <div className='rounded overflow-hidden' style={{ background: '#1A171E', borderRadius: '6px' }}>
    <div className='border-b border-white/5' style={{ background: '#201C24' }}>
      <div className='px-4 py-3 flex flex-row items-center justify-between'>
        <Text size='lg' className={headerColor}>
          {title}
        </Text>
        {subtitle && (
          <Text size='sm' className='text-white/60'>
            {subtitle}
          </Text>
        )}
      </div>
    </div>
    <div className='p-4 space-y-3.5'>
      {Object.entries(rows).map(([key, { label, value, valueColor }]) => (
        <div key={key} className='flex justify-between items-center'>
          <Text className='text-white/60'>{label}</Text>
          <Text className={valueColor ?? ''}>{value}</Text>
        </div>
      ))}
    </div>
  </div>
)

const ConnectionLines = ({ hasBothOrders }: { hasBothOrders: boolean }) => {
  if (hasBothOrders) {
    return (
      <div className='relative h-24 w-full my-4'>
        <div className='absolute left-1/2 top-0 w-[1px] h-12 bg-[#3B333E] transform -translate-x-1/2' />
        <div className='mx-auto w-1/2 relative'>
          <div className='absolute left-0 right-0 top-12 h-[1px] bg-[#3B333E]' />
        </div>
        <div className='absolute left-1/4 top-12 w-[1px] h-12 bg-[#3B333E] transform -translate-x-1/2' />
        <div className='absolute right-1/4 top-12 w-[1px] h-12 bg-[#3B333E] transform translate-x-1/2' />
      </div>
    )
  }

  return (
    <div className='flex justify-center w-full my-4'>
      <div className='w-[1px] h-24 bg-[#3B333E]' />
    </div>
  )
}

const TriggerOrderText = ({ isLong, isTakeProfit }: { isLong: boolean; isTakeProfit: boolean }) => {
  let message = ''

  if (isTakeProfit) {
    message = isLong
      ? 'Take profit order - executes when price rises to target'
      : 'Take profit order - executes when price falls to target'
  } else {
    message = isLong
      ? 'Stop loss order - executes when price falls to target'
      : 'Stop loss order - executes when price rises to target'
  }

  return <Text className='text-white/60 mb-2'>{message}</Text>
}

const findOraclePriceCondition = (order: TriggerOrderResponse | null) => {
  const condition = order?.order.conditions.find(
    (condition: Condition) => 'oracle_price' in condition,
  ) as OraclePriceCondition | undefined

  return condition ? BN(condition.oracle_price.price) : BN(0)
}

const findPerpAction = (order: TriggerOrderResponse) =>
  order.order.actions.find((a: Action) => 'execute_perp_order' in a)

export default function PerpsTriggerOrdersModal() {
  const [parentOrder, setParentOrder] = useState<TriggerOrderResponse | null>(null)
  const [tpOrder, setTpOrder] = useState<TriggerOrderResponse | null>(null)
  const [slOrder, setSlOrder] = useState<TriggerOrderResponse | null>(null)

  const { data: limitOrders } = usePerpsLimitOrders()
  const perpAssets = usePerpsEnabledAssets()
  const orderId = useStore((s) => s.triggerOrdersModal)
  const closeModal = () => useStore.setState({ triggerOrdersModal: null })

  useEffect(() => {
    if (!orderId || !limitOrders) {
      setParentOrder(null)
      setTpOrder(null)
      setSlOrder(null)
      return
    }

    const parent = limitOrders.find((order) => order.order.order_id === orderId)
    if (!parent) return
    setParentOrder(parent)

    const childOrders = limitOrders.filter((order) => {
      const triggerCondition = order.order.conditions.find(
        (condition: Condition) => 'trigger_order_executed' in condition,
      )
      return (
        triggerCondition &&
        'trigger_order_executed' in triggerCondition &&
        triggerCondition.trigger_order_executed.trigger_order_id === orderId
      )
    })

    childOrders.forEach((order) => {
      const oraclePriceCondition = order.order.conditions.find(
        (condition: Condition) => 'oracle_price' in condition,
      )
      if (!oraclePriceCondition || !('oracle_price' in oraclePriceCondition)) return

      const perpAction = findPerpAction(order)
      if (!perpAction || !('execute_perp_order' in perpAction)) return

      const isLong = !perpAction.execute_perp_order.order_size.startsWith('-')
      const comparison = (oraclePriceCondition as OraclePriceCondition).oracle_price.comparison

      if ((isLong && comparison === 'greater_than') || (!isLong && comparison === 'less_than')) {
        setTpOrder(order)
      } else if (
        (isLong && comparison === 'less_than') ||
        (!isLong && comparison === 'greater_than')
      ) {
        setSlOrder(order)
      }
    })
  }, [orderId, limitOrders])

  if (!orderId || !parentOrder) return null

  const parentAction = findPerpAction(parentOrder)
  if (!parentAction || !('execute_perp_order' in parentAction)) return null

  const parentOraclePriceCondition = parentOrder.order.conditions.find(
    (condition: Condition) => 'oracle_price' in condition,
  ) as OraclePriceCondition | undefined

  const asset = perpAssets.find(byDenom(parentAction.execute_perp_order.denom))
  if (!asset) return null

  const isLong = !parentAction.execute_perp_order.order_size.startsWith('-')
  const amount = BN(parentAction.execute_perp_order.order_size).abs()
  const reduceOnly = parentAction.execute_perp_order.reduce_only
  const parentPrice = parentOraclePriceCondition
    ? BN(parentOraclePriceCondition.oracle_price.price)
    : BN(0)

  const displayAmount = demagnify(amount, asset)
  const hasTpOrSl = Boolean(tpOrder || slOrder)
  const hasBothOrders = Boolean(tpOrder && slOrder)

  const sideValue = isLong ? 'Long' : 'Short'
  const sideColor = isLong ? 'text-success' : 'text-error'
  const childSideValue = !isLong ? 'Long' : 'Short'
  const childSideColor = !isLong ? 'text-success' : 'text-error'

  const parentOrderId = parentOrder.order.order_id
  const tpOrderId = tpOrder?.order.order_id
  const slOrderId = slOrder?.order.order_id

  const parentRows: Record<
    string,
    { label: string; value: string | ReactNode; valueColor?: string }
  > = {
    market: { label: 'Market', value: asset.symbol },
    side: {
      label: 'Side',
      value: sideValue,
      valueColor: sideColor,
    },
    amount: { label: 'Amount', value: `${displayAmount.toString()} ${asset.symbol}` },
    reduceOnly: { label: 'Reduce Only', value: reduceOnly ? 'True' : 'False' },
  }

  if (parentOraclePriceCondition) {
    parentRows.limitPrice = {
      label: 'Limit Price',
      value: `$${parentPrice.toString()}`,
    }
  }

  const tpPrice = findOraclePriceCondition(tpOrder)
  const slPrice = findOraclePriceCondition(slOrder)

  const createOrderRows = (price: ReturnType<typeof BN>) => ({
    side: {
      label: 'Side',
      value: childSideValue,
      valueColor: childSideColor,
    },
    amount: { label: 'Amount', value: `${displayAmount.toString()} ${asset.symbol}` },
    stopPrice: { label: 'Stop Price', value: `$${price.toString()}` },
    trigger: { label: 'Trigger', value: 'Market Price' },
  })

  const tpRows = createOrderRows(tpPrice)
  const slRows = createOrderRows(slPrice)

  return (
    <Modal
      header={<Text size='xl'>Take Profit / Stop Loss</Text>}
      headerClassName='gradient-header px-4 py-2.5 border-b-white/5 border-b'
      onClose={closeModal}
      className='bg-[#17141C] border border-white/5 rounded-md'
    >
      <div className='py-6 px-6 bg-[#17141C] max-w-5xl'>
        {hasTpOrSl && (
          <Text className='text-center text-white/60 mb-6'>
            When the parent order is executed, the take profit and stop loss orders are
            automatically placed
          </Text>
        )}

        <div className='flex justify-center mb-0.5'>
          <div className='w-full max-w-md'>
            <OrderCard
              title={`Order ${parentOrderId}`}
              rows={parentRows}
              headerColor='text-amber-500'
            />
          </div>
        </div>

        {hasTpOrSl && (
          <>
            <ConnectionLines hasBothOrders={hasBothOrders} />

            {hasBothOrders && (
              <div className='grid grid-cols-2 gap-0 w-full mb-2'>
                <div className='pr-6'>
                  <TriggerOrderText isLong={isLong} isTakeProfit={true} />
                </div>
                <div className='pl-6'>
                  <div className='text-right'>
                    <TriggerOrderText isLong={isLong} isTakeProfit={false} />
                  </div>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 w-full'>
              {tpOrder && hasBothOrders && (
                <div className='flex justify-center pr-1.5'>
                  <div className='w-full'>
                    <OrderCard
                      title={`Order ${tpOrderId}`}
                      subtitle='Take Profit Market'
                      rows={tpRows}
                      headerColor='text-amber-500'
                    />
                  </div>
                </div>
              )}

              {slOrder && hasBothOrders && (
                <div className='flex justify-center pl-1.5'>
                  <div className='w-full'>
                    <OrderCard
                      title={`Order ${slOrderId}`}
                      subtitle='Stop Market'
                      rows={slRows}
                      headerColor='text-amber-500'
                    />
                  </div>
                </div>
              )}

              {!hasBothOrders && (
                <div className='col-span-2 flex justify-center'>
                  <div className='w-full max-w-md'>
                    {tpOrder && (
                      <>
                        <Text className='text-center text-white/60 mb-2'>
                          <TriggerOrderText isLong={isLong} isTakeProfit={true} />
                        </Text>
                        <OrderCard
                          title={`Order ${tpOrderId}`}
                          subtitle='Take Profit Market'
                          rows={tpRows}
                          headerColor='text-amber-500'
                        />
                      </>
                    )}

                    {slOrder && (
                      <>
                        <Text className='text-center text-white/60 mb-2'>
                          <TriggerOrderText isLong={isLong} isTakeProfit={false} />
                        </Text>
                        <OrderCard
                          title={`Order ${slOrderId}`}
                          subtitle='Stop Market'
                          rows={slRows}
                          headerColor='text-amber-500'
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
