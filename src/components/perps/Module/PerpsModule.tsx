import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Card from 'components/common/Card'
import LeverageSlider from 'components/common/LeverageSlider'
import { Spacer } from 'components/common/Spacer'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import AssetAmountInput from 'components/trade/TradeModule/SwapForm/AssetAmountInput'
import OrderTypeSelector from 'components/trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/trade/TradeModule/SwapForm/OrderTypeSelector/types'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import getPerpsPosition from 'utils/getPerpsPosition'
import { BN } from 'utils/helpers'

export function PerpsModule() {
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { perpsAsset } = usePerpsAsset()
  const account = useCurrentAccount()
  const { simulatePerps, addedPerps } = useUpdatedAccount(account)
  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)
  const { previousAmount, previousTradeDirection, previousLeverage, leverage, hasActivePosition } =
    usePerpsModule(amount)

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((perpsPosition: PerpsPosition) => {
        if (
          addedPerps &&
          perpsPosition.amount === addedPerps.amount &&
          perpsPosition.tradeDirection === addedPerps.tradeDirection
        )
          return
        simulatePerps(perpsPosition)
      }, 100),
    [simulatePerps, addedPerps],
  )

  useEffect(() => {
    const perpsPosition = getPerpsPosition(
      perpsAsset,
      amount ?? previousAmount,
      tradeDirection ?? previousTradeDirection,
    )
    debouncedUpdateAccount(perpsPosition)
  }, [
    debouncedUpdateAccount,
    amount,
    perpsAsset,
    tradeDirection,
    previousAmount,
    previousTradeDirection,
  ])

  const onDebounce = useCallback(() => {
    // TODO:  Implement debounced simulation
  }, [])

  const setLeverage = useCallback((leverage: number) => {
    // TODO: Implement leverage setting
  }, [])

  const onChangeTradeDirection = useCallback(
    (tradeDirection: TradeDirection) => {
      setAmount(amount.times(-1))
      setTradeDirection(tradeDirection)
    },
    [amount],
  )

  const onChangeAmount = useCallback(
    (amount: BigNumber) => {
      if (tradeDirection === 'short') {
        setAmount(amount.times(-1))
        return
      }

      setAmount(amount)
    },
    [tradeDirection],
  )

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='px-4 gap-5 flex flex-col h-full pb-4'
      title={<AssetSelectorPerps asset={perpsAsset} hasActivePosition={hasActivePosition} />}
      className='h-full mb-4'
    >
      <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />
      <TradeDirectionSelector
        direction={tradeDirection}
        onChangeDirection={onChangeTradeDirection}
      />
      <AssetAmountInput
        label='Amount'
        max={BN(1000000)} // TODO: Implement max calculation
        amount={amount.abs()}
        setAmount={onChangeAmount}
        asset={perpsAsset}
        maxButtonLabel='Max:'
        disabled={false}
      />
      {!hasActivePosition && (
        <>
          <Or />
          <Text size='sm'>Position Leverage</Text>
          <LeverageSlider
            min={1}
            max={10}
            value={leverage}
            onChange={setLeverage}
            onDebounce={onDebounce}
            type={tradeDirection}
          />
          <LeverageButtons />
        </>
      )}

      <Spacer />
      <PerpsSummary
        amount={amount ?? previousAmount}
        tradeDirection={tradeDirection ?? previousTradeDirection}
        asset={perpsAsset}
        leverage={leverage}
        previousAmount={previousAmount}
        previousTradeDirection={previousTradeDirection}
        previousLeverage={previousLeverage}
        hasActivePosition={hasActivePosition}
        onTxExecuted={() => setAmount(BN_ZERO)}
      />
    </Card>
  )
}
