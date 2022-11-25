import { Dialog, Transition } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import React, { useMemo, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { toast } from 'react-toastify'

import Slider from 'components/Slider'
import useRepayFunds from 'hooks/mutations/useRepayFunds'
import useAllBalances from 'hooks/useAllBalances'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useTokenPrices from 'hooks/useTokenPrices'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { formatCurrency } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

import Button from './Button'
import CircularProgress from './CircularProgress'
import ContainerSecondary from './ContainerSecondary'

type Props = {
  show: boolean
  onClose: () => void
  tokenDenom: string
}

const RepayModal = ({ show, onClose, tokenDenom }: Props) => {
  const [amount, setAmount] = useState(0)

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')

  const tokenSymbol = getTokenSymbol(tokenDenom)

  const maxRepayAmount = useMemo(() => {
    const tokenDebtAmount =
      positionsData?.debts.find((coin) => coin.denom === tokenDenom)?.amount ?? 0

    return BigNumber(tokenDebtAmount)
      .div(10 ** getTokenDecimals(tokenDenom))
      .toNumber()
  }, [positionsData, tokenDenom])

  const { mutate, isLoading } = useRepayFunds(
    BigNumber(amount)
      .times(10 ** getTokenDecimals(tokenDenom))
      .toNumber(),
    tokenDenom,
    {
      onSuccess: () => {
        onClose()
        toast.success(`${amount} ${tokenSymbol} successfully repaid`)
      },
    },
  )

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

  const handleValueChange = (value: number) => {
    if (value > maxValue) {
      setAmount(maxValue)
      return
    }

    setAmount(value)
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
              <Dialog.Panel className='flex min-h-[520px] w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[#585A74] align-middle shadow-xl transition-all'>
                {isLoading && (
                  <div className='absolute inset-0 z-40 grid place-items-center bg-black/50'>
                    <CircularProgress />
                  </div>
                )}

                <div className='flex flex-1 flex-col items-start justify-between bg-[#4A4C60] p-6'>
                  <div>
                    <p className='text-bold mb-3 text-xs uppercase text-white/50'>About</p>
                    <h4 className='mb-4 text-xl leading-8'>
                      Bringing the next generation of video creation to the Metaverse.
                      <br />
                      Powered by deep-learning.
                    </h4>
                  </div>
                  <Image src='/logo.svg' alt='mars' width={50} height={50} />
                </div>

                <div className='flex flex-1 flex-col p-4'>
                  <Dialog.Title as='h3' className='mb-4 text-center font-medium'>
                    Repay {tokenSymbol}
                  </Dialog.Title>
                  <div className='mb-4 flex flex-col gap-2 text-sm'>
                    <ContainerSecondary>
                      <p className='mb-7'>
                        In wallet: {walletAmount.toLocaleString()} {tokenSymbol}
                      </p>

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
                    className='mt-auto w-full'
                    onClick={handleSubmit}
                    disabled={amount === 0 || !amount}
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
