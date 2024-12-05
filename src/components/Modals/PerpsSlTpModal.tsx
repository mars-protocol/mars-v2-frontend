import Modal from 'components/Modals/Modal'
import AssetAmountInput from 'components/common/AssetAmountInput'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Divider from 'components/common/Divider'
import { TrashBin } from 'components/common/Icons'
import Text from 'components/common/Text'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import { useSubmitLimitOrder } from 'hooks/perps/useSubmitLimitOrder'
import usePrice from 'hooks/prices/usePrice'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatPercent, magnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function PerpsSlTpModal() {
  const [stopLossPrice, setStopLossPrice] = useState(BN_ZERO)
  const [takeProfitPrice, setTakeProfitPrice] = useState(BN_ZERO)
  const [showStopLoss, setShowStopLoss] = useState(false)
  const [showTakeProfit, setShowTakeProfit] = useState(false)

  const [stopLossError, setStopLossError] = useState<string | null>(null)
  const [takeProfitError, setTakeProfitError] = useState<string | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)

  const { data: allAssets } = useAssets()
  const USD = allAssets.find(byDenom('usd'))

  const submitLimitOrder = useSubmitLimitOrder()
  const currentAccount = useCurrentAccount()
  const { perpsAsset } = usePerpsAsset()
  const { data: perpsConfig } = usePerpsConfig()
  const assets = useDepositEnabledAssets()
  const chainConfig = useChainConfig()
  const currentPrice = usePrice(perpsAsset?.denom)

  const assetName = useMemo(() => perpsAsset?.symbol || 'the asset', [perpsAsset])

  const stopLossPercentage = useMemo(() => {
    if (!currentPrice || stopLossPrice.isZero()) return BN_ZERO
    return stopLossPrice.minus(currentPrice).dividedBy(currentPrice).multipliedBy(100)
  }, [currentPrice, stopLossPrice])

  const takeProfitPercentage = useMemo(() => {
    if (!currentPrice || takeProfitPrice.isZero()) return BN_ZERO
    return takeProfitPrice.minus(currentPrice).dividedBy(currentPrice).multipliedBy(100)
  }, [currentPrice, takeProfitPrice])

  const creditManagerConfig = useStore((s) => s.creditManagerConfig)

  const [keeperFee, setKeeperFee] = useLocalStorage(
    `${chainConfig.id}/${LocalStorageKeys.PERPS_KEEPER_FEE}`,
    creditManagerConfig?.keeper_fee_config?.min_fee ??
      getDefaultChainSettings(chainConfig).keeperFee,
  )

  const feeToken = useMemo(
    () => assets.find(byDenom(perpsConfig?.base_denom ?? '')),
    [assets, perpsConfig?.base_denom],
  )

  const calculateKeeperFee = useMemo(
    () =>
      feeToken
        ? BNCoin.fromDenomAndBigNumber(
            feeToken.denom,
            magnify(BN(keeperFee.amount).toNumber(), feeToken),
          )
        : undefined,
    [feeToken, keeperFee.amount],
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

  const validatePrices = useCallback(() => {
    if (!currentPrice) return

    let isValid = true

    if (showStopLoss && !stopLossPrice.isZero()) {
      if (currentTradeDirection === 'long') {
        if (stopLossPrice.isGreaterThanOrEqualTo(currentPrice)) {
          setStopLossError(
            'Stop Loss price must be lower than the current price for long positions',
          )
          isValid = false
        } else {
          setStopLossError(null)
        }
      } else {
        if (stopLossPrice.isLessThanOrEqualTo(currentPrice)) {
          setStopLossError(
            'Stop Loss price must be higher than the current price for short positions',
          )
          isValid = false
        } else {
          setStopLossError(null)
        }
      }
    } else {
      setStopLossError(null)
    }

    if (showTakeProfit && !takeProfitPrice.isZero()) {
      if (currentTradeDirection === 'long') {
        if (takeProfitPrice.isLessThanOrEqualTo(currentPrice)) {
          setTakeProfitError(
            'Take Profit price must be higher than the current price for long positions',
          )
          isValid = false
        } else {
          setTakeProfitError(null)
        }
      } else {
        if (takeProfitPrice.isGreaterThanOrEqualTo(currentPrice)) {
          setTakeProfitError(
            'Take Profit price must be lower than the current price for short positions',
          )
          isValid = false
        } else {
          setTakeProfitError(null)
        }
      }
    } else {
      setTakeProfitError(null)
    }

    const isAnyTriggerSet =
      (showStopLoss && !stopLossPrice.isZero()) || (showTakeProfit && !takeProfitPrice.isZero())

    setIsFormValid(isValid && isAnyTriggerSet)
  }, [
    currentPrice,
    currentTradeDirection,
    showStopLoss,
    stopLossPrice,
    showTakeProfit,
    takeProfitPrice,
  ])

  useEffect(() => {
    validatePrices()
  }, [validatePrices])

  const handleDone = useCallback(async () => {
    if (!currentAccount || !perpsAsset || !feeToken) return

    const createOrders = async () => {
      const orders = []

      if (showStopLoss && !stopLossPrice.isZero()) {
        let tradeDirection: 'long' | 'short'
        let comparison: 'less_than' | 'greater_than'

        if (currentTradeDirection === 'short') {
          tradeDirection = 'short'
          comparison = 'less_than'
        } else {
          tradeDirection = 'long'
          comparison = 'greater_than'
        }

        orders.push({
          asset: perpsAsset,
          orderSize: positionSize.abs(),
          limitPrice: stopLossPrice,
          tradeDirection,
          baseDenom: feeToken.denom,
          keeperFee: calculateKeeperFee ?? BNCoin.fromDenomAndBigNumber(feeToken.denom, BN_ZERO),
          isReduceOnly: true,
          comparison,
        })
      }

      if (showTakeProfit && !takeProfitPrice.isZero()) {
        let tradeDirection: 'long' | 'short'
        let comparison: 'less_than' | 'greater_than'

        if (currentTradeDirection === 'short') {
          tradeDirection = 'long'
          comparison = 'greater_than'
        } else {
          tradeDirection = 'short'
          comparison = 'less_than'
        }

        orders.push({
          asset: perpsAsset,
          orderSize: positionSize.abs(),
          limitPrice: takeProfitPrice,
          tradeDirection,
          baseDenom: feeToken.denom,
          keeperFee: calculateKeeperFee ?? BNCoin.fromDenomAndBigNumber(feeToken.denom, BN_ZERO),
          isReduceOnly: true,
          comparison,
        })
      }

      if (orders.length > 0) {
        await submitLimitOrder(orders)
      }
    }

    await createOrders()
    onClose()
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
  ])

  const handleAddStopLoss = () => {
    setShowStopLoss(true)
  }

  const handleAddTakeProfit = () => {
    setShowTakeProfit(true)
  }

  const handleRemoveStopLoss = () => {
    setShowStopLoss(false)
    setStopLossPrice(BN_ZERO)
  }

  const handleRemoveTakeProfit = () => {
    setShowTakeProfit(false)
    setTakeProfitPrice(BN_ZERO)
  }

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
                asset={USD}
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
              variant='solid'
              textClassNames='text-error items-center'
              className='items-center self-start text-sm'
            />
          </>
        )}
        {!showStopLoss && (
          <Button
            onClick={handleAddStopLoss}
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
                asset={USD}
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
            onClick={handleAddTakeProfit}
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
        <Button
          onClick={handleDone}
          text='Done'
          color='tertiary'
          className='w-full mt-4'
          disabled={!isFormValid}
        />
      </div>
    </Modal>
  )
}
