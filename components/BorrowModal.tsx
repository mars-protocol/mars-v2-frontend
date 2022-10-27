import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { Transition, Dialog, Switch } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'

import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import ContainerSecondary from './ContainerSecondary'
import Button from './Button'
import Spinner from './Spinner'
import useAllBalances from 'hooks/useAllBalances'
import Slider from 'components/Slider'
import useBorrowFunds from 'hooks/mutations/useBorrowFunds'
import useTokenPrices from 'hooks/useTokenPrices'
import useMarkets from 'hooks/useMarkets'
import useCalculateMaxBorrowAmount from 'hooks/useCalculateMaxBorrowAmount'
import Tooltip from './Tooltip'
import { formatCurrency } from 'utils/formatters'

type Props = {
  show: boolean
  onClose: () => void
  tokenDenom: string
}

const BorrowModal = ({ show, onClose, tokenDenom }: Props) => {
  const [amount, setAmount] = useState(0)
  const [borrowToCreditAccount, setBorrowToCreditAccount] = useState(false)

  const tokenSymbol = getTokenSymbol(tokenDenom)

  const { mutate, isLoading } = useBorrowFunds(
    BigNumber(amount)
      .times(10 ** getTokenDecimals(tokenDenom))
      .toNumber(),
    tokenDenom,
    !borrowToCreditAccount,
    {
      onSuccess: () => {
        onClose()
        toast.success(`${amount} ${tokenSymbol} successfully Borrowed`)
      },
    }
  )

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

  const maxValue = useCalculateMaxBorrowAmount(tokenDenom, borrowToCreditAccount)

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
    setBorrowToCreditAccount((c) => !c)
    // reset amount due to max value calculations changing depending on borrow target
    setAmount(0)
  }

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
              <Dialog.Panel className="flex min-h-[520px] w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[#585A74] align-middle shadow-xl transition-all">
                {isLoading && (
                  <div className="absolute inset-0 z-40 grid place-items-center bg-black/50">
                    <Spinner />
                  </div>
                )}

                <div className="flex flex-1 flex-col items-start justify-between bg-[#4A4C60] p-6">
                  <div>
                    <p className="text-bold mb-3 text-xs uppercase text-white/50">About</p>
                    <h4 className="mb-4 text-xl leading-8">
                      Bringing the next generation of video creation to the Metaverse.
                      <br />
                      Powered by deep-learning.
                    </h4>
                  </div>
                  <Image src="/logo.svg" alt="mars" width={150} height={50} />
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <Dialog.Title as="h3" className="mb-4 text-center font-medium">
                    Borrow {tokenSymbol}
                  </Dialog.Title>
                  <div className="mb-4 flex flex-col gap-2 text-sm">
                    <ContainerSecondary>
                      <p className="mb-2">
                        In wallet: {walletAmount.toLocaleString()} {tokenSymbol}
                      </p>
                      <p className="mb-5">Borrow Rate: {(borrowRate * 100).toFixed(2)}%</p>
                      <div className="mb-2 flex justify-between">
                        <div>Amount</div>
                        <input
                          type="number"
                          className="border border-black/50 bg-transparent px-2"
                          value={amount}
                          min="0"
                          onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                        />
                      </div>
                      <div className="mb-4 flex justify-between">
                        <div>
                          1 {tokenSymbol} ={' '}
                          <span className="text-[#585A74]/50">{formatCurrency(tokenPrice)}</span>
                        </div>
                        <div className="text-[#585A74]/50">
                          {formatCurrency(tokenPrice * amount)}
                        </div>
                      </div>
                      <Slider
                        className="mb-6"
                        value={percentageValue}
                        onChange={handleSliderValueChange}
                        onMaxClick={() => setAmount(maxValue)}
                      />
                    </ContainerSecondary>
                    <ContainerSecondary className="flex items-center justify-between">
                      <div className="flex">
                        Borrow to Credit Account{' '}
                        <Tooltip
                          className="ml-2"
                          content={
                            <>
                              <p className="mb-2">
                                OFF = Borrow directly into your wallet by using your account Assets
                                as collateral. The borrowed asset will become a liability in your
                                account.
                              </p>
                              <p>
                                ON = Borrow into your Account. The borrowed asset will be available
                                in the account as an Asset and appear also as a liability in your
                                account.
                              </p>
                            </>
                          }
                        />
                      </div>
                      <Switch
                        checked={borrowToCreditAccount}
                        onChange={handleBorrowTargetChange}
                        className={`${
                          borrowToCreditAccount ? 'bg-blue-600' : 'bg-gray-400'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            borrowToCreditAccount ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </Switch>
                    </ContainerSecondary>
                  </div>
                  <Button
                    className="mt-auto w-full"
                    onClick={handleSubmit}
                    disabled={amount === 0 || !amount}
                  >
                    Borrow
                  </Button>
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
