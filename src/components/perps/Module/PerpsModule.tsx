import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import LeverageSlider from 'components/common/LeverageSlider'
import Text from 'components/common/Text'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import usePerpsModule from 'components/perps/Module/usePerpsModule'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import AssetAmountInput from 'components/trade/TradeModule/SwapForm/AssetAmountInput'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { usePerpsParams } from 'hooks/perps/usePerpsParams'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import usePrice from 'hooks/prices/usePrice'
import usePrices from 'hooks/prices/usePrices'
import { getAccountNetValue } from 'utils/accounts'
import { demagnify } from 'utils/formatters'
import getPerpsPosition from 'utils/getPerpsPosition'
import { BN } from 'utils/helpers'

export function PerpsModule() {
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { data: perpsVault } = usePerpsVault()
  const { perpsAsset } = usePerpsAsset()
  const account = useCurrentAccount()
  const { data: prices } = usePrices()
  const allAssets = useAllWhitelistedAssets()
  const { simulatePerps, updatedPerpPosition, updatedAccount, removedDeposits } =
    useUpdatedAccount(account)
  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)
  const {
    warningMessages,
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    hasActivePosition,
  } = usePerpsModule(amount)

  const [sliderLeverage, setSliderLeverage] = useState<number>(1)

  const { computeMaxPerpAmount } = useHealthComputer(account)

  const { data: tradingFee } = useTradingFeeAndPrice(
    perpsAsset.denom,
    amount.plus(previousAmount),
    previousAmount,
  )
  const perpsOraclePrice = usePrice(perpsAsset.denom)
  const perpsParams = usePerpsParams(perpsAsset.denom)

  const debouncedUpdateAccount = useMemo(
    () =>
      debounce((perpsPosition: PerpsPosition) => {
        if (
          !!updatedPerpPosition &&
          perpsPosition.amount.isEqualTo(updatedPerpPosition.amount) &&
          perpsPosition.tradeDirection === updatedPerpPosition.tradeDirection
        )
          return

        simulatePerps(perpsPosition)
      }, 500),
    [simulatePerps, updatedPerpPosition],
  )

  useEffect(() => {
    const currentPerpPosition = account?.perps.find((p) => p.denom === perpsAsset.denom)
    if (!perpsParams || !tradingFee || !perpsVault) return

    const perpsPosition = getPerpsPosition(
      perpsVault.denom,
      perpsAsset,
      amount.plus(previousAmount),
      tradeDirection ?? previousTradeDirection,
      perpsParams,
      tradingFee,
      currentPerpPosition,
    )

    debouncedUpdateAccount(perpsPosition)
  }, [
    debouncedUpdateAccount,
    amount,
    perpsAsset,
    tradeDirection,
    previousAmount,
    previousTradeDirection,
    perpsParams,
    tradingFee,
    perpsVault,
    account?.perps,
    perpsOraclePrice,
  ])

  const netValue = useMemo(() => {
    if (!account) return BN_ZERO

    return getAccountNetValue(account, prices, allAssets)
  }, [account, allAssets, prices])

  const [maxAmount, maxLeverage] = useMemo(() => {
    let maxAmount = computeMaxPerpAmount(perpsAsset.denom, tradeDirection)

    if (tradeDirection === 'short') maxAmount = maxAmount.plus(previousAmount)
    if (tradeDirection === 'long') maxAmount = maxAmount.minus(previousAmount)

    maxAmount = BigNumber.max(maxAmount, 0).plus(1000000000)
    let maxLeverage = 1

    if (!hasActivePosition) {
      maxLeverage = perpsOraclePrice
        .times(demagnify(maxAmount, perpsAsset))
        .div(netValue)
        .plus(1)
        .toNumber()
    }

    return [maxAmount, maxLeverage]
  }, [
    computeMaxPerpAmount,
    hasActivePosition,
    netValue,
    perpsAsset,
    perpsOraclePrice,
    previousAmount,
    tradeDirection,
  ])

  const onDebounce = useCallback(() => {
    const percentOfMax = BN(sliderLeverage - 1).div(maxLeverage - 1)
    setAmount(maxAmount.times(percentOfMax).integerValue())
  }, [maxAmount, maxLeverage, sliderLeverage])

  const onChangeTradeDirection = useCallback(
    (tradeDirection: TradeDirection) => {
      setAmount(amount.times(-1))
      setTradeDirection(tradeDirection)
    },
    [amount],
  )

  const onChangeAmount = useCallback(
    (amount: BigNumber) => {
      const percentOfMax = BN(amount).div(maxAmount)
      const newLeverage = percentOfMax.times(maxLeverage).toNumber()

      setSliderLeverage(newLeverage)
      if (tradeDirection === 'short') {
        setAmount(amount.times(-1))
        return
      }

      setAmount(amount)
    },
    [maxAmount, maxLeverage, tradeDirection],
  )

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='p-4 px-3 h-auto flex flex-grow flex-col justify-between h-full'
      title={<AssetSelectorPerps asset={perpsAsset} hasActivePosition={hasActivePosition} />}
      className={classNames(
        'mb-4 md:mb-0',
        'md:min-h-[850px]',
        'relative isolate overflow-hidden rounded-base z-30',
      )}
    >
      <div className='flex flex-col gap-5'>
        <TradeDirectionSelector
          direction={tradeDirection}
          onChangeDirection={onChangeTradeDirection}
        />
        <AssetAmountInput
          label='Amount'
          max={maxAmount}
          amount={amount.abs()}
          setAmount={onChangeAmount}
          asset={perpsAsset}
          maxButtonLabel='Max:'
          disabled={false}
        />
        {!hasActivePosition && (
          <div className='w-full'>
            <Or />
            <Text size='sm' className='mt-5 mb-2'>
              Position Leverage
            </Text>
            <LeverageSlider
              min={1}
              max={maxLeverage}
              value={sliderLeverage}
              onChange={setSliderLeverage}
              onDebounce={onDebounce}
              type={tradeDirection}
            />
            {maxLeverage > 5 && (
              <LeverageButtons
                maxLeverage={maxLeverage}
                currentLeverage={leverage}
                maxAmount={maxAmount}
                onChange={(leverage) => {
                  const percentOfMax = BN(leverage - 1).div(maxLeverage - 1)
                  setAmount(maxAmount.times(percentOfMax).integerValue())
                  setSliderLeverage(leverage)
                }}
              />
            )}
          </div>
        )}

        {warningMessages.value.map((message) => (
          <Callout key={message} type={CalloutType.WARNING}>
            {message}
          </Callout>
        ))}
      </div>
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
        disabled={amount.isGreaterThan(maxAmount) || warningMessages.isNotEmpty()}
      />
    </Card>
  )
}
