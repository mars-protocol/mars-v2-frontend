import React, { useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'

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
      toast.success(`${amount} ${tokenSymbol} successfully Borrowed`)
    },
  })

  const { data: tokenPrices } = useTokenPrices()
  const { data: balancesData } = useAllBalances()
  const { data: marketsData } = useMarkets()

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
  const borrowRate = Number(marketsData?.[tokenDenom].borrow_rate)

  const isSubmitDisabled = !amount || amount < 0

  return (
    <Container className="flex w-[350px] flex-col justify-between text-sm">
      <div className="mb-3 flex justify-between text-base font-bold">
        <h3>Borrow {tokenSymbol}</h3>
        <XMarkIcon className="w-5 cursor-pointer" onClick={onClose} />
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <AnotherContainer>
          <p className="mb-2">In wallet: {walletAmount.toLocaleString()}</p>
          <p className="mb-5">Borrow Rate: {(borrowRate * 100).toFixed(2)}%</p>
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
        <AnotherContainer className="flex items-center justify-between">
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
            onChange={setBorrowToCreditAccount}
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
        </AnotherContainer>
      </div>
      <Button className="w-full" onClick={handleSubmit} disabled={isSubmitDisabled}>
        Borrow
      </Button>
    </Container>
  )
}

export default BorrowFunds
