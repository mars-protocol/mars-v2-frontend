import Modal from 'components/Modals/Modal'
import Button from 'components/common/Button'
import Divider from 'components/common/Divider'
import { AlertCircle, TrashBin } from 'components/common/Icons'
import Text from 'components/common/Text'
import { useCallback, useMemo, useState } from 'react'
import useStore from 'store'
import AssetAmountInput from 'components/common/AssetAmountInput'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { useSubmitLimitOrder } from 'hooks/perps/useSubmitLimitOrder'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useAssets from 'hooks/assets/useAssets'
import { byDenom } from 'utils/array'
import usePrice from 'hooks/prices/usePrice'
import BigNumber from 'bignumber.js'
import { formatPercent, magnify } from 'utils/formatters'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function AddSLTPModal() {
  const [stopLossPrice, setStopLossPrice] = useState(BN_ZERO)
  const [takeProfitPrice, setTakeProfitPrice] = useState(BN_ZERO)
  const [showStopLoss, setShowStopLoss] = useState(false)
  const [showTakeProfit, setShowTakeProfit] = useState(false)

  const { data: allAssets } = useAssets()
  const USD = allAssets.find(byDenom('usd'))

  const submitLimitOrder = useSubmitLimitOrder()
  const currentAccount = useCurrentAccount()
  const { perpsAsset } = usePerpsAsset()
  const { data: perpsConfig } = usePerpsConfig()
  const assets = useDepositEnabledAssets()
  const currentPrice = usePrice(perpsAsset?.denom)

  const stopLossPercentage = useMemo(() => {
    if (!currentPrice || stopLossPrice.isZero()) return BN_ZERO
    return stopLossPrice.minus(currentPrice).dividedBy(currentPrice).multipliedBy(100)
  }, [currentPrice, stopLossPrice])

  const takeProfitPercentage = useMemo(() => {
    if (!currentPrice || takeProfitPrice.isZero()) return BN_ZERO
    return takeProfitPrice.minus(currentPrice).dividedBy(currentPrice).multipliedBy(100)
  }, [currentPrice, takeProfitPrice])

  const chainConfig = useChainConfig()

  const [keeperFee, _] = useLocalStorage(
    LocalStorageKeys.PERPS_KEEPER_FEE,
    getDefaultChainSettings(chainConfig).perpsKeeperFee,
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
            magnify(new BigNumber(keeperFee.amount).toNumber(), feeToken),
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
      <div className='flex flex-col p-4 gap-4'>
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
              <div
                className={
                  'flex flex-1 flex-row py-3 border border-white/20 rounded bg-white/5 pl-3 pr-2 mt-2'
                }
              >
                <Text className={stopLossPercentage.isNegative() ? 'text-error' : 'text-success'}>
                  {formatPercent(stopLossPercentage.toNumber())}
                </Text>
              </div>
            </div>
            <Button
              onClick={handleRemoveStopLoss}
              text='Remove trigger'
              color='secondary'
              leftIcon={<TrashBin className='h-4 w-4 text-error self-center' />}
              variant='solid'
              textClassNames='text-error items-center'
              className='text-sm self-start items-center'
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
        <Text size='sm' className='text-white/60 text-left'>
          If ETH falls to your specified price, a market sell will be triggered to prevent any
          further losses.
        </Text>

        <div className='flex flex-row items-center justify-between'>
          <Divider />
          <Text size='sm' className='text-white/60 text-nowrap px-2'>
            AND / OR
          </Text>
          <Divider />
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
              <div
                className={
                  'flex flex-1 flex-row py-3 border border-white/20 rounded bg-white/5 pl-3 pr-2 mt-2'
                }
              >
                <Text className={takeProfitPercentage.isNegative() ? 'text-error' : 'text-success'}>
                  {formatPercent(takeProfitPercentage.toNumber())}
                </Text>
              </div>
            </div>
            <Button
              onClick={handleRemoveTakeProfit}
              text='Remove trigger'
              color='secondary'
              leftIcon={<TrashBin className='h-4 w-4 text-error self-center' />}
              variant='solid'
              textClassNames='text-error items-center'
              className='text-sm self-start items-center'
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
        <Text size='sm' className='text-white/60 text-left'>
          If ETH increases to your specified price, a market sell will be triggered to capture any
          profits.
        </Text>
        <Divider />
        <div className='flex flex-row items-start justify-between mt-4 gap-2'>
          <AlertCircle className='text-white/20 mt-1 flex-shrink-0' />
          <Text size='sm' className='text-white/20 text-left'>
            The prices listed here are 'Spot Price Triggers', which means they initiate your
            transaction. The actual 'Fill Price' at which your transaction is completed may vary due
            to the Funding Rate. This could result in a better fill price if the funding rate is
            favorable, or a less advantageous price if it is not. Always consider the potential
            impact of the funding rate on the final price.
          </Text>
        </div>
        <Button onClick={handleDone} text='Done' color='tertiary' className='w-full mt-4' />
      </div>
    </Modal>
  )
}
