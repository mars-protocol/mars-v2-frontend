import React, { useEffect, useMemo, useState } from 'react'
import { Transition, Dialog, Switch } from '@headlessui/react'
import * as RSlider from '@radix-ui/react-slider'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'

import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import ContainerSecondary from './ContainerSecondary'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import Button from './Button'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import { formatCurrency } from 'utils/formatters'
import ProgressBar from './ProgressBar'
import SemiCircleProgress from './SemiCircleProgress'
import useAccountStats from 'hooks/useAccountStats'
import useWithdrawFunds from 'hooks/mutations/useWithdrawFunds'
import Spinner from './Spinner'
import useCalculateMaxWithdrawAmount from 'hooks/useCalculateMaxWithdrawAmount'
import useAllBalances from 'hooks/useAllBalances'
import Slider from 'components/Slider'

const WithdrawModal = ({ show, onClose }: any) => {
  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState('')
  const [isBorrowEnabled, setIsBorrowEnabled] = useState(false)

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? ''
  )

  const { data: balancesData } = useAllBalances()
  const { data: tokenPrices } = useTokenPrices()
  const { data: marketsData } = useMarkets()
  const accountStats = useAccountStats()

  const selectedTokenSymbol = getTokenSymbol(selectedToken)

  const { mutate, isLoading } = useWithdrawFunds(amount, selectedToken, {
    onSuccess: () => {
      onClose()
      toast.success(`${amount} ${selectedTokenSymbol} successfully withdrawn`)
    },
  })

  const maxWithdrawAmount = useCalculateMaxWithdrawAmount(selectedToken, isBorrowEnabled)

  const walletAmount = useMemo(() => {
    if (!selectedToken) return 0

    return BigNumber(balancesData?.find((balance) => balance.denom === selectedToken)?.amount ?? 0)
      .div(10 ** getTokenDecimals(selectedToken))
      .toNumber()
  }, [balancesData, selectedToken])

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

  const percentageValue = isNaN(amount) ? 0 : (amount * 100) / maxWithdrawAmount

  return (
    <Transition appear show={show} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[#585A74] align-middle shadow-xl transition-all">
                {isLoading && (
                  <div className="absolute inset-0 z-40 grid place-items-center bg-black/50">
                    <Spinner />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <Dialog.Title as="h3" className="mb-4 text-center text-lg font-medium">
                    Withdraw from Account {selectedAccount}
                  </Dialog.Title>
                  <div>
                    <ContainerSecondary className="mb-3 p-3">
                      <div className="mb-4 text-sm">
                        <div className="mb-1 flex justify-between">
                          <div className="font-bold">Asset:</div>
                          <select className="bg-transparent" onChange={handleTokenChange}>
                            {positionsData?.coins?.map((coin) => (
                              <option key={coin.denom} value={coin.denom}>
                                {getTokenSymbol(coin.denom)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-between">
                          <div className="font-bold">Amount:</div>
                          <input
                            type="number"
                            className="border border-black/50 bg-transparent px-2"
                            value={amount}
                            min="0"
                            onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                          />
                        </div>
                      </div>
                      <p className="mb-2 text-sm">In wallet: {walletAmount.toLocaleString()}</p>
                      <Slider
                        className="mb-6"
                        value={percentageValue}
                        onChange={(value) => {
                          const decimal = value[0] / 100
                          const tokenDecimals = getTokenDecimals(selectedToken)
                          // limit decimal precision based on token contract decimals
                          const newAmount = Number(
                            (decimal * maxWithdrawAmount).toFixed(tokenDecimals)
                          )

                          setAmount(newAmount)
                        }}
                        onMaxClick={() => setAmount(maxWithdrawAmount)}
                      />
                    </ContainerSecondary>
                    <ContainerSecondary className="mb-10 flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="font-bold">Withdraw with borrowing</h3>
                        <div className="text-sm text-[#585A74]/50">Explanation....</div>
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
                  <Button className="mt-auto w-full" onClick={() => mutate()}>
                    Withdraw
                  </Button>
                </div>
                <div className="flex flex-1 flex-col justify-center bg-[#4A4C60] p-4">
                  <p className="text-bold mb-3 text-xs uppercase text-white/50">About</p>
                  <h4 className="mb-4 text-xl">Subaccount {selectedAccount}</h4>
                  <div className="mb-2 rounded-md border border-white/20 p-3">
                    {accountStats && (
                      <div className="flex items-center gap-x-3">
                        <p>{formatCurrency(accountStats.netWorth)}</p>
                        {/* TOOLTIP */}
                        <div title={`${String(accountStats.currentLeverage.toFixed(1))}x`}>
                          <SemiCircleProgress
                            value={accountStats.currentLeverage / accountStats.maxLeverage}
                            label="Lvg"
                          />
                        </div>
                        <SemiCircleProgress value={accountStats.risk} label="Risk" />
                        <ProgressBar value={accountStats.health} />
                      </div>
                    )}
                  </div>
                  <div className="mb-2 rounded-md border border-white/20 p-3 text-sm">
                    <div className="mb-1 flex justify-between">
                      <div>Total Position:</div>
                      <div className="font-semibold">
                        {formatCurrency(accountStats?.totalPosition ?? 0)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>Total Liabilities:</div>
                      <div className="font-semibold">
                        {formatCurrency(accountStats?.totalDebt ?? 0)}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border border-white/20 p-3">
                    <h4 className="mb-2 font-bold">Balances</h4>
                    {isLoadingPositions ? (
                      <div>Loading...</div>
                    ) : (
                      <table className="w-full border-separate border-spacing-1">
                        <thead className="text-left text-xs font-semibold">
                          <tr>
                            <th>Asset</th>
                            <th>Value</th>
                            <th>Size</th>
                            <th className="text-right">APY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positionsData?.coins.map((coin) => (
                            <tr key={coin.denom} className="text-xs text-white/50">
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
                              <td className="text-right">-</td>
                            </tr>
                          ))}
                          {positionsData?.debts.map((coin) => (
                            <tr key={coin.denom} className="text-xs text-red-500">
                              <td className="text-white/50">{getTokenSymbol(coin.denom)}</td>
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
                              <td className="text-right">
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
