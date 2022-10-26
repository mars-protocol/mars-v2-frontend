import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Transition, Dialog } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'

import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import ContainerSecondary from './ContainerSecondary'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import Button from './Button'
import Spinner from './Spinner'
import useAllBalances from 'hooks/useAllBalances'
import Slider from 'components/Slider'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useRepayFunds from 'hooks/useRepayFunds'
import useTokenPrices from 'hooks/useTokenPrices'
import { formatCurrency } from 'utils/formatters'

type Props = {
  show: boolean
  onClose: () => void
  tokenDenom: string
}

const RepayModal = ({ show, onClose, tokenDenom }: Props) => {
  const [amount, setAmount] = useState(0)

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')

  useEffect(() => {
    if (show) setAmount(0)
  }, [show])

  const tokenSymbol = getTokenSymbol(tokenDenom)

  const maxRepayAmount = useMemo(() => {
    const tokenDebtAmount =
      positionsData?.debts.find((coin) => coin.denom === tokenDenom)?.amount ?? 0

    return BigNumber(tokenDebtAmount)
      .div(10 ** getTokenDecimals(tokenDenom))
      .toNumber()
  }, [positionsData, tokenDenom])

  const { mutate, isLoading } = useRepayFunds(amount, tokenDenom, {
    onSuccess: () => {
      onClose()
      toast.success(`${amount} ${tokenSymbol} successfully repaid`)
    },
  })

  const { data: tokenPrices } = useTokenPrices()
  const { data: balancesData } = useAllBalances()

  const handleSubmit = () => {
    mutate()
  }

  const walletAmount = useMemo(() => {
    return BigNumber(balancesData?.find((balance) => balance.denom === tokenDenom)?.amount ?? 0)
      .div(10 ** getTokenDecimals(tokenDenom))
      .toNumber()
  }, [balancesData, tokenDenom])

  const tokenPrice = tokenPrices?.[tokenDenom] ?? 0

  const maxValue = walletAmount > maxRepayAmount ? maxRepayAmount : walletAmount
  const percentageValue = isNaN(amount) ? 0 : (amount * 100) / maxValue
  const isSubmitDisabled = !amount || amount < 0

  const handleValueChange = (value: number) => {
    if (value > maxValue) {
      setAmount(maxValue)
      return
    }

    setAmount(value)
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
                    Repay {tokenSymbol}
                  </Dialog.Title>
                  <div className="mb-4 flex flex-col gap-2 text-sm">
                    <ContainerSecondary>
                      <p className="mb-2">
                        In wallet: {walletAmount.toLocaleString()} {tokenSymbol}
                      </p>
                      <div className="mb-2 flex justify-between">
                        <div>Amount</div>
                        <input
                          type="number"
                          className="border border-black/50 bg-transparent px-2"
                          value={amount}
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
                        onChange={(value) => {
                          const decimal = value[0] / 100
                          const tokenDecimals = getTokenDecimals(tokenDenom)
                          // limit decimal precision based on token contract decimals
                          const newAmount = Number((decimal * maxValue).toFixed(tokenDecimals))

                          setAmount(newAmount)
                        }}
                        onMaxClick={() => setAmount(maxValue)}
                      />
                    </ContainerSecondary>
                  </div>
                  <Button
                    className="mt-auto w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                  >
                    Repay
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

export default RepayModal
