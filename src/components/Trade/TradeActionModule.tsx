'use client'

import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'

import Slider from 'components/Slider'
import { Button } from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { ArrowsUpDown } from 'components/Icons'
import { useCalculateMaxTradeAmount } from 'hooks/data/useCalculateMaxTradeAmount'
import { useTradeAsset } from 'hooks/mutations/useTradeAsset'
import { useAllBalances } from 'hooks/queries/useAllBalances'
import { useAllowedCoins } from 'hooks/queries/useAllowedCoins'
import { useCreditAccountPositions } from 'hooks/queries/useCreditAccountPositions'
import { useMarkets } from 'hooks/queries/useMarkets'
import { useTokenPrices } from 'hooks/queries/useTokenPrices'
import useStore from 'store'
import { getMarketAssets } from 'utils/assets'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import Switch from 'components/Switch'

enum FundingMode {
  Account = 'Account',
  WalletAndAccount = 'WalletAndAccount',
}

export const TradeActionModule = () => {
  const marketAssets = getMarketAssets()

  const [selectedTokenIn, setSelectedTokenIn] = useState('')
  const [selectedTokenOut, setSelectedTokenOut] = useState('')
  const [amountIn, setAmountIn] = useState(0)
  const [amountOut, setAmountOut] = useState(0)
  const [slippageTolerance, setSlippageTolerance] = useState(1)
  const [fundingMode, setFundingMode] = useState<FundingMode>(FundingMode.WalletAndAccount)

  const [isMarginEnabled, setIsMarginEnabled] = React.useState(false)

  const selectedAccount = useStore((s) => s.selectedAccount)

  const { data: allowedCoinsData } = useAllowedCoins()
  const { data: balancesData } = useAllBalances()
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')

  const resetAmounts = () => {
    setAmountIn(0)
    setAmountOut(0)
  }

  useEffect(() => {
    resetAmounts()
  }, [selectedAccount])

  const accountAmount = useMemo(() => {
    return Number(positionsData?.coins?.find((coin) => coin.denom === selectedTokenIn)?.amount ?? 0)
  }, [positionsData, selectedTokenIn])

  const walletAmount = useMemo(() => {
    return Number(balancesData?.find((balance) => balance.denom === selectedTokenIn)?.amount ?? 0)
  }, [balancesData, selectedTokenIn])

  const { swapAmount, borrowAmount, depositAmount } = useMemo(() => {
    const swapAmount = amountIn

    let borrowAmount = 0
    let depositAmount = 0

    if (fundingMode === FundingMode.WalletAndAccount) {
      const walletAndAccountAmount = walletAmount + accountAmount

      borrowAmount =
        amountIn > walletAndAccountAmount
          ? BigNumber(amountIn).minus(walletAndAccountAmount).toNumber()
          : 0

      depositAmount = amountIn > walletAmount ? walletAmount : amountIn
    }

    if (fundingMode === FundingMode.Account) {
      borrowAmount =
        amountIn > accountAmount ? BigNumber(amountIn).minus(accountAmount).toNumber() : 0
    }

    return { swapAmount, borrowAmount, depositAmount }
  }, [accountAmount, amountIn, fundingMode, walletAmount])

  const { mutate, isLoading } = useTradeAsset(
    swapAmount,
    borrowAmount,
    depositAmount,
    selectedTokenIn,
    selectedTokenOut,
    slippageTolerance / 100,
    {
      onSuccess: () => {
        useStore.setState({
          toast: {
            message: `${amountIn} ${getTokenSymbol(
              selectedTokenIn,
              marketAssets,
            )} swapped for ${amountOut} ${getTokenSymbol(selectedTokenOut, marketAssets)}`,
          },
        })
        resetAmounts()
      },
    },
  )

  useEffect(() => {
    if (allowedCoinsData && allowedCoinsData.length > 0) {
      // initialize selected token when allowedCoins fetch data is available
      setSelectedTokenIn(allowedCoinsData[0])

      if (allowedCoinsData.length > 1) {
        setSelectedTokenOut(allowedCoinsData[1])
      } else {
        setSelectedTokenOut(allowedCoinsData[0])
      }
    }
  }, [allowedCoinsData])

  const handleSelectedTokenInChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenIn(e.target.value)
    resetAmounts()
  }

  const handleSelectedTokenOutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenOut(e.target.value)
    resetAmounts()
  }

  const handleFundingModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFundingMode(e.target.value as FundingMode)
    resetAmounts()
  }

  // max amount that can be traded without considering wallet amount
  // wallet amount should just be directly added to this amount in case user wants to include wallet as funding source
  const maxTradeAmount = useCalculateMaxTradeAmount(
    selectedTokenIn,
    selectedTokenOut,
    isMarginEnabled,
  )

  // if funding from wallet & account, add wallet amount to the max trade amount
  const maxAmount = useMemo(() => {
    if (fundingMode === FundingMode.WalletAndAccount) {
      return walletAmount + maxTradeAmount
    }

    return maxTradeAmount
  }, [fundingMode, maxTradeAmount, walletAmount])

  const percentageValue = useMemo(() => {
    if (isNaN(amountIn) || amountIn === 0) return 0

    return amountIn / maxAmount > 1 ? 100 : (amountIn / maxAmount) * 100
  }, [amountIn, maxAmount])

  const borrowRate = Number(marketsData?.[selectedTokenOut]?.borrow_rate)

  const handleAmountChange = (value: number, mode: 'in' | 'out') => {
    const tokenInPrice = tokenPrices?.[selectedTokenIn] ?? 1
    const tokenOutPrice = tokenPrices?.[selectedTokenOut] ?? 1

    const priceRatio = BigNumber(tokenInPrice).div(tokenOutPrice)

    if (mode === 'in') {
      setAmountIn(value)
      setAmountOut(BigNumber(value).times(priceRatio).decimalPlaces(0).toNumber())
    } else {
      setAmountOut(value)
      setAmountIn(BigNumber(value).div(BigNumber(1).times(priceRatio)).decimalPlaces(0).toNumber())
    }
  }

  const submitDisabled = selectedTokenIn === selectedTokenOut || !amountIn || amountIn > maxAmount

  return (
    <div>
      {isLoading && (
        <div className='fixed inset-0 z-40 grid place-items-center bg-black/50'>
          <CircularProgress />
        </div>
      )}
      <div className='border-b border-b-white/20 p-2'>
        <div className='mb-2'>
          <p className='mb-1'>From:</p>
          <div className='flex gap-2'>
            <select
              className='h-8 w-20 text-black'
              onChange={handleSelectedTokenInChange}
              value={selectedTokenIn}
            >
              {allowedCoinsData?.map((entry) => (
                <option key={entry} value={entry}>
                  {getTokenSymbol(entry, marketAssets)}
                </option>
              ))}
            </select>
            <input
              type='number'
              className='h-8 flex-1 px-2 text-black outline-0'
              value={amountIn / 10 ** getTokenDecimals(selectedTokenIn, marketAssets)}
              min='0'
              placeholder='0.00'
              onChange={(e) => {
                const valueAsNumber = e.target.valueAsNumber
                const valueWithDecimals =
                  valueAsNumber * 10 ** getTokenDecimals(selectedTokenIn, marketAssets)

                handleAmountChange(valueWithDecimals, 'in')
              }}
            />
          </div>
        </div>
        <div
          className='mx-auto h-5 w-6 cursor-pointer text-white/70 hover:text-white'
          onClick={() => {
            setSelectedTokenIn(selectedTokenOut)
            setSelectedTokenOut(selectedTokenIn)
            resetAmounts()
          }}
        >
          <ArrowsUpDown />
        </div>
        <div className='mb-5'>
          <p className='mb-1'>To:</p>
          <div className='flex gap-2'>
            <select
              className='h-8 w-20 text-black'
              onChange={handleSelectedTokenOutChange}
              value={selectedTokenOut}
            >
              {allowedCoinsData?.map((entry) => (
                <option key={entry} value={entry}>
                  {getTokenSymbol(entry, marketAssets)}
                </option>
              ))}
            </select>
            <input
              type='number'
              className='h-8 flex-1 px-2 text-black outline-0'
              value={amountOut / 10 ** getTokenDecimals(selectedTokenOut, marketAssets)}
              min='0'
              placeholder='0.00'
              onChange={(e) => {
                const valueAsNumber = e.target.valueAsNumber
                const valueWithDecimals =
                  valueAsNumber * 10 ** getTokenDecimals(selectedTokenOut, marketAssets)

                handleAmountChange(valueWithDecimals, 'out')
              }}
            />
          </div>
        </div>
        <div className='mb-1'>
          In Wallet:{' '}
          {BigNumber(walletAmount)
            .dividedBy(10 ** getTokenDecimals(selectedTokenIn, marketAssets))
            .toNumber()
            .toLocaleString(undefined, {
              maximumFractionDigits: getTokenDecimals(selectedTokenIn, marketAssets),
            })}{' '}
          <span>{getTokenSymbol(selectedTokenIn, marketAssets)}</span>
        </div>
        <div className='mb-4'>
          In Account:{' '}
          {BigNumber(accountAmount)
            .dividedBy(10 ** getTokenDecimals(selectedTokenIn, marketAssets))
            .toNumber()
            .toLocaleString(undefined, {
              maximumFractionDigits: getTokenDecimals(selectedTokenIn, marketAssets),
            })}{' '}
          <span>{getTokenSymbol(selectedTokenIn, marketAssets)}</span>
        </div>
        <Slider
          className='mb-6'
          value={percentageValue}
          onChange={(value) => {
            const decimal = value / 100
            const tokenDecimals = getTokenDecimals(selectedTokenIn, marketAssets)
            // limit decimal precision based on token contract decimals
            const newAmount = Number((decimal * maxAmount).toFixed(0))

            handleAmountChange(newAmount, 'in')
          }}
        />
      </div>
      <div className='border-b border-b-white/20 p-2'>
        <div className='mb-4 flex items-center'>
          <p className='mr-2'>Margin</p>
          <Switch
            name='marginEnabled'
            checked={isMarginEnabled}
            onChange={(value: boolean) => {
              // reset amounts only if margin is turned off
              if (!value) resetAmounts()

              setIsMarginEnabled(value)
            }}
          />
        </div>
        <div className='mb-1 flex justify-between'>
          <p>Borrow</p>
          <p>
            {isMarginEnabled
              ? BigNumber(borrowAmount)
                  .dividedBy(10 ** getTokenDecimals(selectedTokenIn, marketAssets))
                  .toNumber()
                  .toLocaleString(undefined, {
                    maximumFractionDigits: getTokenDecimals(selectedTokenIn, marketAssets),
                  })
              : '-'}
          </p>
        </div>
        <div className='flex justify-between'>
          <p>Borrow Rate</p>
          <p>{isMarginEnabled ? `${(borrowRate * 100).toFixed(2)}%` : '-'}</p>
        </div>
      </div>
      <div className='p-2'>
        <div className='mb-6'>OTHER INFO PLACEHOLDER</div>
        <div className='mb-2 flex justify-between'>
          <p>Slippage Tolerance:</p>
          <input
            type='number'
            step='0.1'
            className='w-20 px-2 text-black'
            onChange={(e) => setSlippageTolerance(e.target.valueAsNumber)}
            value={slippageTolerance}
          />
        </div>
        <div className='flex justify-between'>
          <p>Funded From</p>
          <select value={fundingMode} className='text-black' onChange={handleFundingModeChange}>
            <option value={FundingMode.Account}>Account</option>
            <option value={FundingMode.WalletAndAccount}>Wallet & Account</option>
          </select>
        </div>
      </div>
      <Button className='w-full' onClick={() => mutate()} disabled={submitDisabled}>
        Create Order
      </Button>
    </div>
  )
}
