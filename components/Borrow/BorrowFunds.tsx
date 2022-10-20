import React, { useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import * as Slider from '@radix-ui/react-slider'

import Button from 'components/Button'
import Container from 'components/Container'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import useBorrowFunds from 'hooks/useBorrowFunds'
import useTokenPrices from 'hooks/useTokenPrices'
import { formatCurrency } from 'utils/formatters'
import { Switch } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import useAllBalances from 'hooks/useAllBalances'
import useMarkets from 'hooks/useMarkets'
import Tooltip from 'components/Tooltip'
import ContainerSecondary from 'components/ContainerSecondary'
import Spinner from 'components/Spinner'
import useCalculateMaxBorrowAmount from 'hooks/useCalculateMaxBorrowAmount'

const BorrowFunds = ({ tokenDenom, onClose }: any) => {
  const [amount, setAmount] = useState(0)
  const [borrowToCreditAccount, setBorrowToCreditAccount] = useState(false)

  const tokenSymbol = getTokenSymbol(tokenDenom)

  const { mutate, isLoading } = useBorrowFunds(amount, tokenDenom, !borrowToCreditAccount, {
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
  const borrowRate = Number(marketsData?.[tokenDenom].borrow_rate)

  const maxValue = useCalculateMaxBorrowAmount(tokenDenom, borrowToCreditAccount)

  const percentageValue = useMemo(() => {
    if (isNaN(amount) || maxValue === 0) return 0

    return (amount * 100) / maxValue
  }, [amount, maxValue])

  const isSubmitDisabled = !amount || amount < 0

  const handleValueChange = (value: number) => {
    if (value > maxValue) {
      setAmount(maxValue)
      return
    }

    setAmount(value)
  }

  const handleBorrowTargetChange = () => {
    setBorrowToCreditAccount((c) => !c)
    // reset amount due to max value calculations changing depending on borrow target
    setAmount(0)
  }

  return (
    <Container className="flex w-[350px] flex-col justify-between text-sm">
      {isLoading && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/50">
          <Spinner />
        </div>
      )}
      <div className="mb-3 flex justify-between text-base font-bold">
        <h3>Borrow {tokenSymbol}</h3>
        <XMarkIcon className="w-5 cursor-pointer" onClick={onClose} />
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <ContainerSecondary>
          <p className="mb-2">
            In wallet:{' '}
            <span className="text-[#585A74]/50">
              {walletAmount.toLocaleString()} {tokenSymbol}
            </span>
          </p>
          <p className="mb-5">
            Borrow Rate: <span className="text-[#585A74]/50">{(borrowRate * 100).toFixed(2)}%</span>
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
          <div className="flex justify-between">
            <div>
              1 {tokenSymbol} ={' '}
              <span className="text-[#585A74]/50">{formatCurrency(tokenPrice)}</span>
            </div>
            <div className="text-[#585A74]/50">{formatCurrency(tokenPrice * amount)}</div>
          </div>
        </ContainerSecondary>
        <ContainerSecondary>
          <div className="relative mb-4 flex flex-1 items-center">
            <Slider.Root
              className="relative flex h-[20px] w-full cursor-pointer touch-none select-none items-center"
              value={[percentageValue]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => {
                const decimal = value[0] / 100
                const tokenDecimals = getTokenDecimals(tokenDenom)
                // limit decimal precision based on token contract decimals
                const newAmount = Number((decimal * maxValue).toFixed(tokenDecimals))

                setAmount(newAmount)
              }}
            >
              <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-400">
                <Slider.Range className="absolute h-[100%] rounded-full bg-blue-600" />
              </Slider.Track>
              <Slider.Thumb className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white !outline-none">
                <div className="relative top-5 text-xs">{percentageValue.toFixed(0)}%</div>
              </Slider.Thumb>
            </Slider.Root>
            <button
              className="ml-4 rounded-md bg-blue-600 py-1 px-2 text-xs font-semibold text-white"
              onClick={() => setAmount(maxValue)}
            >
              MAX
            </button>
          </div>
        </ContainerSecondary>
        <ContainerSecondary className="flex items-center justify-between">
          <div className="flex">
            Borrow to Credit Account{' '}
            <Tooltip
              className="ml-2"
              content={
                <>
                  <p className="mb-2">
                    OFF = Borrow directly into your wallet by using your account Assets as
                    collateral. The borrowed asset will become a liability in your account.
                  </p>
                  <p>
                    ON = Borrow into your Account. The borrowed asset will be available in the
                    account as an Asset and appear also as a liability in your account.
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
      <Button className="w-full" onClick={handleSubmit} disabled={isSubmitDisabled}>
        Borrow
      </Button>
    </Container>
  )
}

export default BorrowFunds
