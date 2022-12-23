import { Dialog, Switch, Transition } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import React, { useMemo, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { toast } from 'react-toastify'

import {
  Button,
  CircularProgress,
  ContainerSecondary,
  Gauge,
  PositionsList,
  ProgressBar,
  Slider,
  Text,
  Tooltip,
} from 'components'
import { useAccountStats, useBalances, useCalculateMaxBorrowAmount } from 'hooks/data'
import { useBorrowFunds } from 'hooks/mutations'
import { useAllBalances, useMarkets, useTokenPrices } from 'hooks/queries'
import { useAccountDetailsStore, useNetworkConfigStore } from 'stores'
import { formatCurrency, formatValue } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

type Props = {
  show: boolean
  onClose: () => void
  tokenDenom: string
}

export const BorrowModal = ({ show, onClose, tokenDenom }: Props) => {
  const [amount, setAmount] = useState(0)
  const [isBorrowToCreditAccount, setIsBorrowToCreditAccount] = useState(false)

  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)
  const whitelistedAssets = useNetworkConfigStore((s) => s.assets.whitelist)
  const baseAsset = useNetworkConfigStore((s) => s.assets.base)

  const balances = useBalances()

  const { actions, borrowAmount } = useMemo(() => {
    const borrowAmount = BigNumber(amount)
      .times(10 ** getTokenDecimals(tokenDenom, whitelistedAssets))
      .toNumber()

    const withdrawAmount = isBorrowToCreditAccount ? 0 : borrowAmount

    return {
      borrowAmount,
      withdrawAmount,
      actions: [
        {
          type: 'borrow',
          amount: borrowAmount,
          denom: tokenDenom,
        },
        {
          type: 'withdraw',
          amount: withdrawAmount,
          denom: tokenDenom,
        },
      ] as AccountStatsAction[],
    }
  }, [amount, isBorrowToCreditAccount, tokenDenom, whitelistedAssets])

  const accountStats = useAccountStats(actions)

  const tokenSymbol = getTokenSymbol(tokenDenom, whitelistedAssets)

  const { mutate, isLoading } = useBorrowFunds(borrowAmount, tokenDenom, !isBorrowToCreditAccount, {
    onSuccess: () => {
      onClose()
      toast.success(`${amount} ${tokenSymbol} successfully Borrowed`)
    },
  })

  const { data: tokenPrices } = useTokenPrices()
  const { data: balancesData } = useAllBalances()
  const { data: marketsData } = useMarkets()

  const handleSubmit = () => {
    mutate()
  }

  const walletAmount = useMemo(() => {
    return BigNumber(balancesData?.find((balance) => balance.denom === tokenDenom)?.amount ?? 0)
      .div(10 ** getTokenDecimals(tokenDenom, whitelistedAssets))
      .toNumber()
  }, [balancesData, tokenDenom, whitelistedAssets])

  const tokenPrice = tokenPrices?.[tokenDenom] ?? 0
  const borrowRate = Number(marketsData?.[tokenDenom]?.borrow_rate)

  const maxValue = useCalculateMaxBorrowAmount(tokenDenom, isBorrowToCreditAccount)

  const percentageValue = useMemo(() => {
    if (isNaN(amount) || maxValue === 0) return 0

    return (amount * 100) / maxValue
  }, [amount, maxValue])

  const handleValueChange = (value: number) => {
    if (value > maxValue) {
      setAmount(maxValue)
      return
    }

    setAmount(value)
  }

  const handleSliderValueChange = (value: number[]) => {
    const decimal = value[0] / 100
    const tokenDecimals = getTokenDecimals(tokenDenom, whitelistedAssets)
    // limit decimal precision based on token contract decimals
    const newAmount = Number((decimal * maxValue).toFixed(tokenDecimals))

    setAmount(newAmount)
  }

  const handleBorrowTargetChange = () => {
    setIsBorrowToCreditAccount((c) => !c)
    // reset amount due to max value calculations changing depending on borrow target
    setAmount(0)
  }

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
                    <CircularProgress />
                  </div>
                )}
                <div className='flex flex-1 flex-col p-4'>
                  <Dialog.Title as='h3' className='mb-4 text-center font-medium'>
                    Borrow {tokenSymbol}
                  </Dialog.Title>
                  <div className='mb-4 flex flex-col gap-2 text-sm'>
                    <ContainerSecondary>
                      <p className='mb-1'>
                        In wallet: {walletAmount.toLocaleString()} {tokenSymbol}
                      </p>
                      <p className='mb-5'>Borrow Rate: {(borrowRate * 100).toFixed(2)}%</p>

                      <div className='mb-7'>
                        <p className='mb-2 font-semibold uppercase tracking-widest'>Amount</p>
                        <NumericFormat
                          className='mb-2 h-[32px] w-full rounded-lg border border-black/50 bg-transparent px-2'
                          value={amount}
                          placeholder='0'
                          allowNegative={false}
                          onValueChange={(v) => handleValueChange(v.floatValue || 0)}
                          suffix={` ${tokenSymbol}`}
                          decimalScale={getTokenDecimals(tokenDenom, whitelistedAssets)}
                        />
                        <div className='flex justify-between text-xs tracking-widest'>
                          <div>
                            1 {tokenSymbol} = {formatCurrency(tokenPrice)}
                          </div>
                          <div>{formatCurrency(tokenPrice * amount)}</div>
                        </div>
                      </div>
                      <Slider
                        className='mb-6'
                        value={percentageValue}
                        onChange={handleSliderValueChange}
                        onMaxClick={() => setAmount(maxValue)}
                      />
                    </ContainerSecondary>
                    <ContainerSecondary className='flex items-center justify-between'>
                      <div className='flex'>
                        Borrow to Credit Account{' '}
                        <Tooltip
                          className='ml-2'
                          content={
                            <>
                              <Text size='sm' className='mb-2'>
                                OFF = Borrow directly into your wallet by using your account Assets
                                as collateral. The borrowed asset will become a liability in your
                                account.
                              </Text>
                              <Text size='sm'>
                                ON = Borrow into your Account. The borrowed asset will be available
                                in the account as an Asset and appear also as a liability in your
                                account.
                              </Text>
                            </>
                          }
                        />
                      </div>
                      <Switch
                        checked={isBorrowToCreditAccount}
                        onChange={handleBorrowTargetChange}
                        className={`${
                          isBorrowToCreditAccount ? 'bg-blue-600' : 'bg-gray-400'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            isBorrowToCreditAccount ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </Switch>
                    </ContainerSecondary>
                  </div>
                  <Button
                    className='mt-auto'
                    onClick={handleSubmit}
                    disabled={amount === 0 || !amount}
                  >
                    Borrow
                  </Button>
                </div>

                <div className='flex w-1/2 flex-col justify-center bg-[#4A4C60] p-4'>
                  <p className='text-bold mb-3 text-xs uppercase text-white/50'>About</p>
                  <h4 className='mb-4 text-xl'>Account {selectedAccount}</h4>
                  <div className='mb-2 rounded-md border border-white/20 p-3'>
                    {accountStats && (
                      <div className='flex items-center gap-x-3'>
                        <p className='flex-1 text-xs'>
                          {formatCurrency(
                            BigNumber(accountStats.netWorth)
                              .dividedBy(10 ** baseAsset.decimals)
                              .toNumber(),
                          )}
                        </p>
                        <Gauge
                          value={accountStats.currentLeverage / accountStats.maxLeverage}
                          label='Lvg'
                          tooltip={
                            <Text size='sm'>
                              Current Leverage:{' '}
                              {formatValue(accountStats.currentLeverage, 0, 2, true, false, 'x')}
                              <br />
                              Max Leverage:{' '}
                              {formatValue(accountStats.maxLeverage, 0, 2, true, false, 'x')}
                            </Text>
                          }
                        />
                        <Gauge
                          value={accountStats.risk}
                          label='Risk'
                          tooltip={
                            <Text size='sm'>
                              Current Risk:{' '}
                              {formatValue(accountStats.risk * 100, 0, 2, true, false, '%')}
                            </Text>
                          }
                        />
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
                            .dividedBy(10 ** baseAsset.decimals)
                            .toNumber(),
                        )}
                      </div>
                    </div>
                    <div className='flex justify-between'>
                      <div>Total Liabilities:</div>
                      <div className='font-semibold'>
                        {formatCurrency(
                          BigNumber(accountStats?.totalDebt ?? 0)
                            .dividedBy(10 ** baseAsset.decimals)
                            .toNumber(),
                        )}
                      </div>
                    </div>
                  </div>
                  <PositionsList title='Balances' data={balances} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
