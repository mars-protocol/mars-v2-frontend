import React, { useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'

import Button from 'components/Button'
import Container from 'components/Container'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import useBorrowFunds from 'hooks/useBorrowFunds'
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

const BorrowFunds = ({ tokenDenom, onClose }: any) => {
  const [amount, setAmount] = useState(0)
  const [borrowToCreditAccount, setBorrowToCreditAccount] = useState(false)

  const tokenSymbol = getTokenSymbol(tokenDenom)

  const { mutate } = useBorrowFunds(amount, tokenDenom, !borrowToCreditAccount, {
    onSuccess: () => {
      onClose()
      toast.success(`${amount} ${tokenSymbol} successfully repaid”`)
    },
  })

  const { data: tokenPrices } = useTokenPrices()
  const { data: balancesData } = useAllBalances()

  const handleValueChange = (value: number) => {
    // if (value > walletAmount) {
    //   setAmount(walletAmount)
    //   return
    // }

    setAmount(value)
  }

  const handleSubmit = () => {
    mutate()
  }

  const walletAmount = useMemo(() => {
    return BigNumber(balancesData?.find((balance) => balance.denom === tokenDenom)?.amount ?? 0)
      .div(10 ** getTokenDecimals(tokenDenom))
      .toNumber()
  }, [balancesData, tokenDenom])

  const tokenPrice = tokenPrices?.[tokenDenom] ?? 0

  const isSubmitDisabled = !amount || amount < 0

  return (
    <Container className="flex w-[350px] flex-col justify-between text-sm">
      <div className="mb-3 flex justify-between text-base font-bold">
        <h3>Repay {tokenSymbol}</h3>
        <XMarkIcon className="w-5 cursor-pointer" onClick={onClose} />
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <AnotherContainer>
          <p className="mb-2">In wallet: {walletAmount.toLocaleString()}</p>
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
              1 {tokenSymbol} = {formatCurrency(tokenPrice)}
            </div>
            <div>{formatCurrency(tokenPrice * amount)}</div>
          </div>
        </AnotherContainer>
        <AnotherContainer className="h-[90px]">Insert Slider HERE</AnotherContainer>
      </div>
      <Button className="w-full" onClick={handleSubmit} disabled={isSubmitDisabled}>
        Repay
      </Button>
    </Container>
  )
}

export default BorrowFunds
