import React, { useState } from 'react'
import BigNumber from 'bignumber.js'

import Button from '../Button'
import { formatCurrency } from 'utils/formatters'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'
import useCreditAccountBalances from 'hooks/useCreditAccountPositions'
import { getTokenDecimals } from 'utils/tokens'
import FundAccount from './FundAccount'

export const ContainerStyled = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={`p-2 bg-[#D8DAEA] rounded-lg text-[#585A74] ${className}`}>{children}</div>
}

const CreditManager = () => {
  const [isFund, setIsFund] = useState(false)

  const address = useWalletStore((state) => state.address)
  const selectedAccount = useCreditManagerStore((state) => state.selectedAccount)

  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountBalances(
    selectedAccount ?? ''
  )

  const totalPosition =
    positionsData?.coins.reduce((acc, coin) => {
      return Number(coin.value) + acc
    }, 0) ?? 0

  const totalDebt =
    positionsData?.debt.reduce((acc, coin) => {
      return Number(coin.value) + acc
    }, 0) ?? 0

  if (!address) {
    return (
      <div className="absolute inset-0 left-auto p-2 w-[400px] bg-background-2 border-l border-white/20">
        <ContainerStyled>You must have a connected wallet</ContainerStyled>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 left-auto p-2 w-[400px] bg-background-2 border-l border-white/20">
      <ContainerStyled className="mb-2">
        {isFund ? (
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Fund Account</h3>
            <Button className="rounded-md" onClick={() => setIsFund(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button className="rounded-md flex-1" onClick={() => setIsFund(true)}>
              Fund
            </Button>
            <Button className="rounded-md flex-1" onClick={() => alert('TODO')}>
              Withdraw
            </Button>
          </div>
        )}
      </ContainerStyled>
      {isFund ? (
        <FundAccount />
      ) : (
        <>
          <ContainerStyled className="mb-2 text-sm">
            <div className="flex justify-between mb-1">
              <div>Total Position:</div>
              <div className="font-semibold">{formatCurrency(totalPosition)}</div>
            </div>
            <div className="flex justify-between">
              <div>Total Liabilities:</div>
              <div className="font-semibold">{formatCurrency(totalDebt)}</div>
            </div>
          </ContainerStyled>
          <ContainerStyled>
            <h4 className="font-bold">Balances</h4>
            {isLoadingPositions ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="flex font-semibold text-xs">
                  <div className="flex-1">Asset</div>
                  <div className="flex-1">Value</div>
                  <div className="flex-1">Size</div>
                  <div className="flex-1">APY</div>
                </div>
                {positionsData?.coins.map((coin) => (
                  <div key={coin.denom} className="flex text-xs text-black/40">
                    <div className="flex-1">{coin.denom}</div>
                    <div className="flex-1">{formatCurrency(coin.value)}</div>
                    <div className="flex-1">
                      {BigNumber(coin.amount)
                        .div(10 ** getTokenDecimals(coin.denom))
                        .toNumber()
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                    </div>
                    <div className="flex-1">-</div>
                  </div>
                ))}
                {positionsData?.debt.map((coin) => (
                  <div key={coin.denom} className="flex text-xs text-red-500">
                    <div className="flex-1">{coin.denom}</div>
                    <div className="flex-1">{formatCurrency(coin.value)}</div>
                    <div className="flex-1">
                      {BigNumber(coin.amount)
                        .div(10 ** getTokenDecimals(coin.denom))
                        .toNumber()
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                    </div>
                    <div className="flex-1">-</div>
                  </div>
                ))}
              </>
            )}
          </ContainerStyled>
        </>
      )}
    </div>
  )
}

export default CreditManager
