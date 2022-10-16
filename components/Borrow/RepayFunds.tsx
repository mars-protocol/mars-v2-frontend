import React, { useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import * as Slider from '@radix-ui/react-slider'

import Button from 'components/Button'
import Container from 'components/Container'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import useRepayFunds from 'hooks/useRepayFunds'
import useTokenPrices from 'hooks/useTokenPrices'
import { formatCurrency } from 'utils/formatters'
import BigNumber from 'bignumber.js'
import useAllBalances from 'hooks/useAllBalances'

const AnotherContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`rounded-md bg-[#D8DAEA] px-3 py-2 text-[#585A74] ${className}`}>
      {children}
    </div>
  )
}

const RepayFunds = ({ tokenDenom, amount: repayAmount, onClose }: any) => {
  const [amount, setAmount] = useState(0)

  const tokenSymbol = getTokenSymbol(tokenDenom)

  const { mutate } = useRepayFunds(amount, tokenDenom, {
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

  const maxValue = walletAmount > repayAmount ? repayAmount : walletAmount
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
    <Container className="flex w-[350px] flex-col justify-between text-sm">
      <div className="mb-3 flex justify-between text-base font-bold">
        <h3>Repay {tokenSymbol}</h3>
        <XMarkIcon className="w-5 cursor-pointer" onClick={onClose} />
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <AnotherContainer>
          <p className="mb-2">
            In wallet:{' '}
            <span className="text-[#585A74]/50">
              {walletAmount.toLocaleString()} {tokenSymbol}
            </span>
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
        </AnotherContainer>
        <AnotherContainer>
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
              className="ml-4 rounded-md bg-blue-600 py-1 px-2 text-sm text-white"
              onClick={() => setAmount(maxValue)}
            >
              MAX
            </button>
          </div>
        </AnotherContainer>
      </div>
      <Button className="w-full" onClick={handleSubmit} disabled={isSubmitDisabled}>
        Repay
      </Button>
    </Container>
  )
}

export default RepayFunds
