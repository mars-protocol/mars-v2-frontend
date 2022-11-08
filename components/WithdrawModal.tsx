import { Dialog, Switch, Transition } from '@headlessui/react'
import * as RSlider from '@radix-ui/react-slider'
import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import Slider from 'components/Slider'
import useWithdrawFunds from 'hooks/mutations/useWithdrawFunds'
import useAllBalances from 'hooks/useAllBalances'
import useCalculateMaxWithdrawAmount from 'hooks/useCalculateMaxWithdrawAmount'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { formatCurrency } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import useAccountStats, { AccountStatsAction } from 'hooks/useAccountStats'
import { chain } from 'utils/chains'

import Spinner from './Spinner'
import SemiCircleProgress from './SemiCircleProgress'
import ProgressBar from './ProgressBar'
import ContainerSecondary from './ContainerSecondary'
import Button from './Button'

const WithdrawModal = ({ show, onClose }: any) => {
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
      onClose()
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
    <Transition appear show={show} as={React.Fragment}>
      <Dialog as='div' className='relative z-10' onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-80' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='flex w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[#585A74] align-middle shadow-xl transition-all'>
                {isLoading && (
                  <div className='absolute inset-0 z-40 grid place-items-center bg-black/50'>
                    <Spinner />
                  </div>
                )}
                <div className='flex w-1/2 flex-col p-4'>
                  <Dialog.Title as='h3' className='mb-4 text-center text-lg font-medium'>
                    Withdraw from Account {selectedAccount}
                  </Dialog.Title>
                  <div>
                    <ContainerSecondary className='mb-3 p-3'>
                      <div className='mb-4 text-sm'>
                        <div className='mb-1 flex justify-between'>
                          <div className='font-bold'>Asset:</div>
                          <select className='bg-transparent' onChange={handleTokenChange}>
                            {positionsData?.coins?.map((coin) => (
                              <option key={coin.denom} value={coin.denom}>
                                {getTokenSymbol(coin.denom)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='flex justify-between'>
                          <div className='font-bold'>Amount:</div>
                          <input
                            type='number'
                            className='border border-black/50 bg-transparent px-2'
                            value={amount}
                            min='0'
                            onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                          />
                        </div>
                      </div>
                      <p className='mb-2 text-sm'>In wallet: {walletAmount.toLocaleString()}</p>
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
                    </ContainerSecondary>
                    <ContainerSecondary className='mb-10 flex items-center justify-between'>
                      <div className='text-left'>
                        <h3 className='font-bold'>Withdraw with borrowing</h3>
                        <div className='text-sm text-[#585A74]/50'>Explanation....</div>
                      </div>

                      <Switch
                        checked={isBorrowEnabled}
                        onChange={handleBorrowChange}
                        className={`${
                          isBorrowEnabled ? 'bg-blue-600' : 'bg-gray-400'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            isBorrowEnabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </Switch>
                    </ContainerSecondary>
                  </div>
                  <Button className='mt-auto w-full' onClick={() => mutate()}>
                    Withdraw
                  </Button>
                </div>
                <div className='flex w-1/2 flex-col justify-center bg-[#4A4C60] p-4'>
                  <p className='text-bold mb-3 text-xs uppercase text-white/50'>About</p>
                  <h4 className='mb-4 text-xl'>Subaccount {selectedAccount}</h4>
                  <div className='mb-2 rounded-md border border-white/20 p-3'>
                    {accountStats && (
                      <div className='flex items-center gap-x-3'>
                        <p className='flex-1 text-xs'>
                          {formatCurrency(
                            BigNumber(accountStats.netWorth)
                              .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                              .toNumber(),
                          )}
                        </p>
                        {/* TOOLTIP */}
                        <div title={`${String(accountStats.currentLeverage.toFixed(1))}x`}>
                          <SemiCircleProgress
                            value={accountStats.currentLeverage / accountStats.maxLeverage}
                            label='Lvg'
                          />
                        </div>
                        <SemiCircleProgress value={accountStats.risk} label='Risk' />
                        <ProgressBar value={accountStats.health} />
                      </div>
                    )}
                  </div>
                  <div className='mb-2 rounded-md border border-white/20 p-3 text-sm'>
                    <div className='mb-1 flex justify-between'>
                      <div>Total Position:</div>
                      <div className='font-semibold'>
                        {formatCurrency(
                          BigNumber(accountStats?.totalPosition ?? 0)
                            .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                            .toNumber(),
                        )}
                      </div>
                    </div>
                    <div className='flex justify-between'>
                      <div>Total Liabilities:</div>
                      <div className='font-semibold'>
                        {formatCurrency(
                          BigNumber(accountStats?.totalDebt ?? 0)
                            .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                            .toNumber(),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='rounded-md border border-white/20 p-3'>
                    <h4 className='mb-2 font-bold'>Balances</h4>
                    {isLoadingPositions ? (
                      <div>Loading...</div>
                    ) : (
                      <table className='w-full border-separate border-spacing-1'>
                        <thead className='text-left text-xs font-semibold'>
                          <tr>
                            <th>Asset</th>
                            <th>Value</th>
                            <th>Size</th>
                            <th className='text-right'>APY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positionsData?.coins.map((coin) => (
                            <tr key={coin.denom} className='text-xs text-white/50'>
                              <td>{getTokenSymbol(coin.denom)}</td>
                              <td>
                                {formatCurrency(getTokenTotalUSDValue(coin.amount, coin.denom))}
                              </td>
                              <td>
                                {BigNumber(coin.amount)
                                  .div(10 ** getTokenDecimals(coin.denom))
                                  .toNumber()
                                  .toLocaleString(undefined, {
                                    maximumFractionDigits: getTokenDecimals(coin.denom),
                                  })}
                              </td>
                              <td className='text-right'>-</td>
                            </tr>
                          ))}
                          {positionsData?.debts.map((coin) => (
                            <tr key={coin.denom} className='text-xs text-red-500'>
                              <td className='text-white/50'>{getTokenSymbol(coin.denom)}</td>
                              <td>
                                -{formatCurrency(getTokenTotalUSDValue(coin.amount, coin.denom))}
                              </td>
                              <td>
                                -
                                {BigNumber(coin.amount)
                                  .div(10 ** getTokenDecimals(coin.denom))
                                  .toNumber()
                                  .toLocaleString(undefined, {
                                    maximumFractionDigits: 6,
                                  })}
                              </td>
                              <td className='text-right'>
                                -{(Number(marketsData?.[coin.denom].borrow_rate) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default WithdrawModal
