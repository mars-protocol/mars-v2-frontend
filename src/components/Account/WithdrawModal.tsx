import { Switch } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { BorrowCapacity } from 'components/BorrowCapacity'
import { convertFromGwei, formatLeverage, formatValue } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import { CircularProgress } from 'components/CircularProgress'
import { Button } from 'components/Button'
import { Text } from 'components/Text'
import { Slider } from 'components/Slider'
import { FormattedNumber } from 'components/FormattedNumber'
import { Gauge } from 'components/Gauge'
import { LabelValuePair } from 'components/LabelValuePair'
import { Modal } from 'components/Modal'
import { PositionsList } from 'components/PositionsList'
import { useAccountStats } from 'hooks/data/useAccountStats'
import { useCalculateMaxWithdrawAmount } from 'hooks/data/useCalculateMaxWithdrawAmount'
import { useWithdrawFunds } from 'hooks/mutations/useWithdrawFunds'
import { useCreditAccountPositions } from 'hooks/queries/useCreditAccountPositions'
import { useTokenPrices } from 'hooks/queries/useTokenPrices'
import useStore from 'store'
import { getBaseAsset, getMarketAssets } from 'utils/assets'

export const WithdrawModal = () => {
  // ---------------
  // STORE
  // ---------------
  const open = useStore((s) => s.withdrawModal)
  const selectedAccount = useStore((s) => s.selectedAccount)
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const marketAssets = getMarketAssets()
  const baseAsset = getBaseAsset()

  // ---------------
  // LOCAL STATE
  // ---------------
  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState('')
  const [isBorrowEnabled, setIsBorrowEnabled] = useState(false)

  // ---------------
  // EXTERNAL HOOKS
  // ---------------
  const { data: tokenPrices } = useTokenPrices()

  const selectedTokenSymbol = getTokenSymbol(selectedToken, marketAssets)
  const selectedTokenDecimals = getTokenDecimals(selectedToken, marketAssets)

  const tokenAmountInCreditAccount = useMemo(() => {
    return BigNumber(positionsData?.coins.find((coin) => coin.denom === selectedToken)?.amount ?? 0)
      .div(10 ** selectedTokenDecimals)
      .toNumber()
  }, [positionsData, selectedTokenDecimals, selectedToken])

  const { actions, borrowAmount, withdrawAmount } = useMemo(() => {
    const borrowAmount =
      amount > tokenAmountInCreditAccount
        ? BigNumber(amount)
            .minus(tokenAmountInCreditAccount)
            .times(10 ** selectedTokenDecimals)
            .toNumber()
        : 0

    const withdrawAmount = BigNumber(amount)
      .times(10 ** selectedTokenDecimals)
      .toNumber()

    return {
      borrowAmount,
      withdrawAmount,
      actions: [
        {
          type: 'borrow',
          amount: borrowAmount,
          denom: selectedToken,
        },
        {
          type: 'withdraw',
          amount: withdrawAmount,
          denom: selectedToken,
        },
      ] as AccountStatsAction[],
    }
  }, [amount, selectedToken, selectedTokenDecimals, tokenAmountInCreditAccount])

  const accountStats = useAccountStats(actions)

  const { mutate, isLoading } = useWithdrawFunds(withdrawAmount, borrowAmount, selectedToken, {
    onSuccess: () => {
      useStore.setState({
        withdrawModal: false,
        toast: {
          message: `${amount} ${selectedTokenSymbol} successfully withdrawn`,
        },
      })
    },
  })

  const maxWithdrawAmount = useCalculateMaxWithdrawAmount(selectedToken, isBorrowEnabled)

  useEffect(() => {
    if (positionsData && positionsData.coins.length > 0) {
      // initialize selected token when allowedCoins fetch data is available
      setSelectedToken(positionsData.coins[0].denom)
    }
  }, [positionsData])

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken(e.target.value)

    if (e.target.value !== selectedToken) setAmount(0)
  }

  const handleValueChange = (value: number) => {
    if (value > maxWithdrawAmount) {
      setAmount(maxWithdrawAmount)
      return
    }

    setAmount(value)
  }

  const handleBorrowChange = () => {
    setIsBorrowEnabled((c) => !c)
    // reset amount due to max value calculations changing depending on wheter the user is borrowing or not
    setAmount(0)
  }

  const getTokenTotalUSDValue = (amount: string, denom: string, marketAssets: Asset[]) => {
    // early return if prices are not fetched yet
    if (!tokenPrices) return 0

    return (
      BigNumber(amount)
        .div(10 ** getTokenDecimals(denom, marketAssets))
        .toNumber() * tokenPrices[denom]
    )
  }

  const percentageValue = useMemo(() => {
    if (isNaN(amount) || maxWithdrawAmount === 0) return 0

    return (amount * 100) / maxWithdrawAmount
  }, [amount, maxWithdrawAmount])

  const setOpen = (open: boolean) => {
    useStore.setState({ withdrawModal: open })
  }

  return (
    <Modal title='Withdraw' open={open} setOpen={setOpen}>
      <div className='flex min-h-[470px] w-full flex-wrap'>
        {isLoading && (
          <div className='absolute inset-0 z-40 grid place-items-center bg-black/50'>
            <CircularProgress />
          </div>
        )}

        <Text
          className='flex w-full border-b border-white/20 px-8 pt-4 pb-2 text-white'
          size='2xl'
          uppercase
        >
          Withdraw from Account {selectedAccount}
        </Text>
        <div className='flex w-full'>
          <div className='flex flex-1 flex-col border-r border-white/20'>
            <div className='border-b border-white/20 p-6'>
              <div className='mb-4 rounded-md border border-white/20'>
                <div className='mb-1 flex justify-between border-b border-white/20 p-2'>
                  <Text size='sm' className='text-white'>
                    Asset:
                  </Text>
                  <select
                    className='bg-transparent text-white outline-0'
                    onChange={handleTokenChange}
                    value={selectedToken}
                  >
                    {positionsData?.coins?.map((coin) => (
                      <option key={coin.denom} value={coin.denom}>
                        {getTokenSymbol(coin.denom, marketAssets)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex justify-between p-2'>
                  <Text size='sm' className='text-white'>
                    Amount:
                  </Text>
                  <input
                    type='number'
                    className='appearance-none bg-transparent text-right text-white'
                    value={amount}
                    min='0'
                    onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                    onBlur={(e) => {
                      if (e.target.value === '') setAmount(0)
                    }}
                  />
                </div>
              </div>
              <Text size='xs' uppercase className='mb-2 text-white/60'>
                Available: {formatValue(maxWithdrawAmount, { minDecimals: 0, maxDecimals: 4 })}
              </Text>
              <Slider
                className='mb-6'
                value={percentageValue}
                onChange={(value) => {
                  const decimal = value[0] / 100
                  // limit decimal precision based on token contract decimals
                  const newAmount = Number(
                    (decimal * maxWithdrawAmount).toFixed(selectedTokenDecimals),
                  )

                  setAmount(newAmount)
                }}
                onMaxClick={() => setAmount(maxWithdrawAmount)}
              />
            </div>
            <div className='flex items-center justify-between p-6'>
              <div className='flex flex-1 flex-wrap'>
                <Text size='sm' className='text-white' uppercase>
                  Withdraw with borrowing
                </Text>
                <Text size='sm' className='text-white/60'>
                  Borrow assets from account to withdraw to your wallet
                </Text>
              </div>

              <Switch
                checked={isBorrowEnabled}
                onChange={handleBorrowChange}
                className={classNames(
                  'relative inline-flex h-6 w-11 items-center rounded-full',
                  isBorrowEnabled ? 'bg-blue-600' : 'bg-gray-400',
                )}
              >
                <span
                  className={`${
                    isBorrowEnabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white`}
                />
              </Switch>
            </div>
            <div className='flex p-6'>
              <Button className='mt-auto w-full' onClick={() => mutate()}>
                Withdraw
              </Button>
            </div>
          </div>
          <div className='flex w-[430px] flex-wrap content-start bg-black/60'>
            <div className='flex w-full flex-wrap border-b border-white/20 p-6'>
              <Text size='xl' className='mb-4 flex w-full text-white'>
                Account {selectedAccount}
              </Text>
              {accountStats && (
                <div className='flex w-full items-center gap-x-3'>
                  <Text size='sm' className='flex flex-grow text-white'>
                    <FormattedNumber
                      amount={BigNumber(accountStats.netWorth)
                        .dividedBy(10 ** baseAsset.decimals)
                        .toNumber()}
                      options={{ prefix: '$: ' }}
                      animate
                    />
                  </Text>

                  <Gauge
                    value={accountStats.currentLeverage / accountStats.maxLeverage}
                    label='Lvg'
                    tooltip={
                      <Text size='sm'>
                        Current Leverage: {formatLeverage(accountStats.currentLeverage)}
                        <br />
                        Max Leverage: {formatLeverage(accountStats.maxLeverage)}
                      </Text>
                    }
                  />
                  <Gauge
                    value={accountStats.risk}
                    label='Risk'
                    tooltip={
                      <Text size='sm'>
                        Current Risk:{' '}
                        {formatValue(accountStats.risk * 100, { minDecimals: 0, suffix: '%' })}
                      </Text>
                    }
                  />
                  <BorrowCapacity
                    limit={80}
                    max={100}
                    balance={100 - accountStats.health * 100}
                    barHeight='16px'
                    hideValues={true}
                    showTitle={false}
                    className='w-[140px]'
                  />
                </div>
              )}
            </div>
            <div className='flex w-full flex-wrap border-b border-white/20 p-6'>
              <LabelValuePair
                className='mb-2'
                label='Total Position:'
                value={{
                  format: 'number',
                  amount: convertFromGwei(
                    accountStats?.totalPosition ?? 0,
                    baseAsset.denom,
                    marketAssets,
                  ),
                  prefix: '$',
                }}
              />
              <LabelValuePair
                label='Total Liabilities:'
                value={{
                  format: 'number',
                  amount: convertFromGwei(
                    accountStats?.totalDebt ?? 0,
                    baseAsset.denom,
                    marketAssets,
                  ),
                  prefix: '$',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
