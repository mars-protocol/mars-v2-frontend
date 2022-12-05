import { Dialog, Switch, Transition } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import React, { useMemo, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { toast } from 'react-toastify'

import Button from 'components/Button'
import CircularProgress from 'components/CircularProgress'
import ContainerSecondary from 'components/ContainerSecondary'
import ProgressBar from 'components/ProgressBar'
import SemiCircleProgress from 'components/SemiCircleProgress'
import Slider from 'components/Slider'
import Text from 'components/Text'
import Tooltip from 'components/Tooltip'
import useBorrowFunds from 'hooks/mutations/useBorrowFunds'
import useAccountStats, { AccountStatsAction } from 'hooks/useAccountStats'
import useAllBalances from 'hooks/useAllBalances'
import useCalculateMaxBorrowAmount from 'hooks/useCalculateMaxBorrowAmount'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { chain } from 'utils/chains'
import { formatCurrency } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

type Props = {
  show: boolean
  onClose: () => void
  tokenDenom: string
}

const BorrowModal = ({ show, onClose, tokenDenom }: Props) => {
  const [amount, setAmount] = useState(0)
  const [isBorrowToCreditAccount, setIsBorrowToCreditAccount] = useState(false)

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? '',
  )

  const { actions, borrowAmount } = useMemo(() => {
    const borrowAmount = BigNumber(amount)
      .times(10 ** getTokenDecimals(tokenDenom))
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
  }, [amount, isBorrowToCreditAccount, tokenDenom])

  const accountStats = useAccountStats(actions)

  const tokenSymbol = getTokenSymbol(tokenDenom)

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
      .div(10 ** getTokenDecimals(tokenDenom))
      .toNumber()
  }, [balancesData, tokenDenom])

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
    const tokenDecimals = getTokenDecimals(tokenDenom)
    // limit decimal precision based on token contract decimals
    const newAmount = Number((decimal * maxValue).toFixed(tokenDecimals))

    setAmount(newAmount)
  }

  const handleBorrowTargetChange = () => {
    setIsBorrowToCreditAccount((c) => !c)
    // reset amount due to max value calculations changing depending on borrow target
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
                          decimalScale={getTokenDecimals(tokenDenom)}
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
                          {accountStats?.assets.map((coin) => (
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
                          {accountStats?.debts.map((coin) => (
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

export default BorrowModal
