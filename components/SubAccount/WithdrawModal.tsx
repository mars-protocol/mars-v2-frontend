import { Switch } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import classNames from 'classnames'
import { BorrowCapacity } from 'components/BorrowCapacity'
import Button from 'components/Button'
import CircularProgress from 'components/CircularProgress'
import Gauge from 'components/Gauge'
import Modal from 'components/Modal'
import Slider from 'components/Slider'
import Text from 'components/Text'
import Tooltip from 'components/Tooltip'
import useWithdrawFunds from 'hooks/mutations/useWithdrawFunds'
import useAccountStats, { AccountStatsAction } from 'hooks/useAccountStats'
import useAllBalances from 'hooks/useAllBalances'
import useCalculateMaxWithdrawAmount from 'hooks/useCalculateMaxWithdrawAmount'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { chain } from 'utils/chains'
import { formatValue } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

const WithdrawModal = ({ open, setOpen }: Props) => {
  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState('')
  const [isBorrowEnabled, setIsBorrowEnabled] = useState(false)

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? '',
  )

  const { data: balancesData } = useAllBalances()
  const { data: tokenPrices } = useTokenPrices()
  const { data: marketsData } = useMarkets()

  const selectedTokenSymbol = getTokenSymbol(selectedToken)
  const selectedTokenDecimals = getTokenDecimals(selectedToken)

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
      setOpen(false)
      toast.success(`${amount} ${selectedTokenSymbol} successfully withdrawn`)
    },
  })

  const maxWithdrawAmount = useCalculateMaxWithdrawAmount(selectedToken, isBorrowEnabled)

  const walletAmount = useMemo(() => {
    if (!selectedToken) return 0

    return BigNumber(balancesData?.find((balance) => balance.denom === selectedToken)?.amount ?? 0)
      .div(10 ** selectedTokenDecimals)
      .toNumber()
  }, [balancesData, selectedToken, selectedTokenDecimals])

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

  const getTokenTotalUSDValue = (amount: string, denom: string) => {
    // early return if prices are not fetched yet
    if (!tokenPrices) return 0

    return (
      BigNumber(amount)
        .div(10 ** getTokenDecimals(denom))
        .toNumber() * tokenPrices[denom]
    )
  }

  const percentageValue = useMemo(() => {
    if (isNaN(amount) || maxWithdrawAmount === 0) return 0

    return (amount * 100) / maxWithdrawAmount
  }, [amount, maxWithdrawAmount])

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className='flex min-h-[470px] w-full flex-wrap'>
        {isLoading && (
          <div className='absolute inset-0 z-40 grid place-items-center bg-black/50'>
            <CircularProgress />
          </div>
        )}

        <Text
          className='flex w-full border-b border-white/20 px-8 pt-4 pb-2 text-white'
          size='2xl'
          uppercase={true}
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
                        {getTokenSymbol(coin.denom)}
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
              <Text size='xs' uppercase={true} className='mb-2 text-white/60'>
                Available: {formatValue(maxWithdrawAmount, 0, 4, true, false, false, false, false)}
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
                <Text size='sm' className='text-white' uppercase={true}>
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
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
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
                    {formatValue(
                      BigNumber(accountStats.netWorth)
                        .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                        .toNumber(),
                      2,
                      2,
                      true,
                      '$: ',
                      false,
                      false,
                    )}
                  </Text>
                  <Tooltip
                    content={
                      <Text size='sm'>
                        {formatValue(accountStats.currentLeverage, 0, 2, false, false, 'x')}
                      </Text>
                    }
                  >
                    <Gauge
                      value={accountStats.currentLeverage / accountStats.maxLeverage}
                      label='Lvg'
                    />
                  </Tooltip>
                  <Gauge value={accountStats.risk} label='Risk' />
                  <BorrowCapacity
                    limit={80}
                    max={100}
                    balance={100 - accountStats.health * 100}
                    barHeight='16px'
                    decimals={1}
                    hideValues={true}
                    showTitle={false}
                    className='w-[140px]'
                    percentageDelta={40}
                  />
                </div>
              )}
            </div>
            <div className='flex w-full flex-wrap border-b border-white/20 p-6'>
              <div className='mb-2 flex w-full'>
                <Text size='xs' className='flex-grow text-white/60'>
                  Total Position:
                </Text>

                <Text size='xs' className='text-white/60'>
                  {formatValue(
                    BigNumber(accountStats?.totalPosition ?? 0)
                      .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                      .toNumber(),
                    2,
                    2,
                    true,
                    '$',
                  )}
                </Text>
              </div>
              <div className='flex w-full justify-between'>
                <Text size='xs' className='flex-grow text-white/60'>
                  Total Liabilities:
                </Text>
                <Text size='xs' className=' text-white/60'>
                  {formatValue(
                    BigNumber(accountStats?.totalDebt ?? 0)
                      .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                      .toNumber(),
                    2,
                    2,
                    true,
                    '$',
                  )}
                </Text>
              </div>
            </div>
            <div className='flex w-full flex-wrap'>
              <Text uppercase={true} className='w-full bg-black/20 px-6 py-2 text-white/40'>
                Balances
              </Text>
              {isLoadingPositions ? (
                <div>Loading...</div>
              ) : (
                <div className='flex w-full flex-wrap'>
                  <div className='mb-2 flex w-full border-b border-white/20 bg-black/20 px-6 py-2 '>
                    <Text size='xs' uppercase={true} className='flex-1 text-white'>
                      Asset
                    </Text>
                    <Text size='xs' uppercase={true} className='flex-1 text-white'>
                      Value
                    </Text>
                    <Text size='xs' uppercase={true} className='flex-1 text-white'>
                      Size
                    </Text>
                    <Text size='xs' uppercase={true} className='flex-1 text-white'>
                      APY
                    </Text>
                  </div>
                  {positionsData?.coins.map((coin) => (
                    <div key={coin.denom} className='flex w-full px-4 py-2'>
                      <Text
                        size='xs'
                        className='flex-1 border-l-4 border-profit pl-2 text-white/60'
                      >
                        {getTokenSymbol(coin.denom)}
                      </Text>
                      <Text size='xs' className='flex-1 text-white/60'>
                        {formatValue(
                          getTokenTotalUSDValue(coin.amount, coin.denom),
                          2,
                          2,
                          true,
                          '$',
                        )}
                      </Text>
                      <Text size='xs' className='flex-1 text-white/60'>
                        {formatValue(
                          BigNumber(coin.amount)
                            .div(10 ** getTokenDecimals(coin.denom))
                            .toNumber(),
                          0,
                          4,
                          true,
                        )}
                      </Text>
                      <Text size='xs' className='flex-1 text-white/60'>
                        -
                      </Text>
                    </div>
                  ))}
                  {positionsData?.debts.map((coin) => (
                    <div key={coin.denom} className='flex w-full px-4 py-2'>
                      <Text size='xs' className='flex-1 border-l-4 border-loss pl-2 text-white/60'>
                        {getTokenSymbol(coin.denom)}
                      </Text>
                      <Text size='xs' className='flex-1 text-white/60'>
                        {formatValue(
                          getTokenTotalUSDValue(coin.amount, coin.denom),
                          2,
                          2,
                          true,
                          '-$',
                        )}
                      </Text>
                      <Text size='xs' className='flex-1 text-white/60'>
                        {formatValue(
                          BigNumber(coin.amount)
                            .div(10 ** getTokenDecimals(coin.denom))
                            .toNumber(),
                          0,
                          4,
                          true,
                        )}
                      </Text>
                      <Text size='xs' className='flex-1 text-white/60'>
                        -{(Number(marketsData?.[coin.denom].borrow_rate) * 100).toFixed(1)}%
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WithdrawModal
