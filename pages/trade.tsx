import React, { useEffect, useMemo, useState } from 'react'
import { Switch } from '@headlessui/react'
import BigNumber from 'bignumber.js'

import Container from 'components/Container'
import Button from 'components/Button'
import useAllowedCoins from 'hooks/useAllowedCoins'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import Slider from 'components/Slider'
import useTradeAsset from 'hooks/mutations/useTradeAsset'
import useAllBalances from 'hooks/useAllBalances'
import useMarkets from 'hooks/useMarkets'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useTokenPrices from 'hooks/useTokenPrices'
import useCalculateMaxSwappableAmount from 'hooks/useCalculateMaxSwappableAmount'

enum FundingMode {
  Wallet = 'Wallet',
  CreditAccount = 'CreditAccount',
  Both = 'Both',
}

const Trade = () => {
  const [selectedTokenIn, setSelectedTokenIn] = useState('')
  const [selectedTokenOut, setSelectedTokenOut] = useState('')
  const [amountIn, setAmountIn] = useState(0)
  const [amountOut, setAmountOut] = useState(0)
  const [fundingMode, setFundingMode] = useState<FundingMode>(FundingMode.CreditAccount)

  const [isMarginEnabled, setIsMarginEnabled] = React.useState(false)

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: allowedCoinsData } = useAllowedCoins()
  const { data: balancesData } = useAllBalances()
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')

  const { mutate } = useTradeAsset(
    BigNumber(amountIn)
      .times(10 ** getTokenDecimals(selectedTokenIn))
      .toNumber(),
    selectedTokenIn,
    selectedTokenOut,
    0.1,
  )

  useEffect(() => {
    if (allowedCoinsData && allowedCoinsData.length > 0) {
      // initialize selected token when allowedCoins fetch data is available
      setSelectedTokenOut(allowedCoinsData[0])

      if (allowedCoinsData.length > 1) {
        setSelectedTokenIn(allowedCoinsData[1])
      } else {
        setSelectedTokenIn(allowedCoinsData[0])
      }
    }
  }, [allowedCoinsData])

  const handleSelectedTokenInChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenIn(e.target.value)
    setAmountIn(0)
    setAmountOut(0)
  }

  const handleSelectedTokenOutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenOut(e.target.value)
    setAmountIn(0)
    setAmountOut(0)
  }

  const handleFundingModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFundingMode(e.target.value as FundingMode)
    setAmountIn(0)
    setAmountOut(0)
  }

  const { accountAmount, walletAmount } = useMemo(() => {
    const accountAmount = BigNumber(
      positionsData?.coins?.find((coin) => coin.denom === selectedTokenIn)?.amount ?? 0,
    )
      .div(10 ** getTokenDecimals(selectedTokenIn))
      .toNumber()

    const walletAmount = BigNumber(
      balancesData?.find((balance) => balance.denom === selectedTokenIn)?.amount ?? 0,
    )
      .div(10 ** getTokenDecimals(selectedTokenIn))
      .toNumber()

    return { accountAmount, walletAmount }
  }, [balancesData, positionsData, selectedTokenIn])

  const maxAmount = useCalculateMaxSwappableAmount(selectedTokenIn, selectedTokenOut, fundingMode)

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
      setAmountOut(
        BigNumber(value)
          .times(priceRatio)
          .decimalPlaces(getTokenDecimals(selectedTokenOut))
          .toNumber(),
      )
    } else {
      setAmountOut(value)
      setAmountIn(
        BigNumber(1)
          .div(BigNumber(value).times(priceRatio))
          .decimalPlaces(getTokenDecimals(selectedTokenIn))
          .toNumber(),
      )
    }
  }

  const submitDisabled = selectedTokenIn === selectedTokenOut || !amountIn || amountIn > maxAmount

  return (
    <div>
      <div className='mb-4 flex gap-4'>
        <Container className='grid flex-1 place-items-center'>Graph/Tradingview Module</Container>
        <div className='flex flex-col gap-4'>
          <Container className='!p-2 text-sm'>
            <div className='border-b border-b-white/20 p-2'>
              <div className='mb-2'>
                <p className='mb-1'>From:</p>
                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <select
                      className='h-8 w-full text-black'
                      onChange={handleSelectedTokenInChange}
                      value={selectedTokenIn}
                    >
                      {allowedCoinsData?.map((entry) => (
                        <option key={entry} value={entry}>
                          {getTokenSymbol(entry)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type='number'
                      className='h-8 px-2 text-black outline-0'
                      value={amountIn}
                      min='0'
                      placeholder='0.00'
                      onChange={(e) => handleAmountChange(e.target.valueAsNumber, 'in')}
                    />
                  </div>
                </div>
              </div>
              <div className='mb-5'>
                <p className='mb-1'>To:</p>
                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <select
                      className='h-8 w-full text-black'
                      onChange={handleSelectedTokenOutChange}
                      value={selectedTokenOut}
                    >
                      {allowedCoinsData?.map((entry) => (
                        <option key={entry} value={entry}>
                          {getTokenSymbol(entry)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type='number'
                      className='h-8 px-2 text-black outline-0'
                      value={amountOut}
                      min='0'
                      placeholder='0.00'
                      onChange={(e) => handleAmountChange(e.target.valueAsNumber, 'out')}
                    />
                  </div>
                </div>
              </div>
              <div className='mb-1'>
                In Wallet:{' '}
                {walletAmount.toLocaleString(undefined, {
                  maximumFractionDigits: getTokenDecimals(selectedTokenIn),
                })}
              </div>
              <div className='mb-4'>
                In Account:{' '}
                {accountAmount.toLocaleString(undefined, {
                  maximumFractionDigits: getTokenDecimals(selectedTokenIn),
                })}
              </div>
              <Slider
                className='mb-6'
                value={percentageValue}
                onChange={(value) => {
                  const decimal = value[0] / 100
                  const tokenDecimals = getTokenDecimals(selectedTokenIn)
                  // limit decimal precision based on token contract decimals
                  const newAmount = Number((decimal * maxAmount).toFixed(tokenDecimals))

                  handleAmountChange(newAmount, 'in')
                }}
                onMaxClick={() => setAmountIn(maxAmount)}
              />
            </div>
            <div className='border-b border-b-white/20 p-2'>
              <div className='mb-4 flex items-center'>
                <p className='mr-2'>Margin</p>
                <Switch
                  checked={isMarginEnabled}
                  onChange={setIsMarginEnabled}
                  className={`${
                    isMarginEnabled ? 'bg-[#524BB1]' : 'bg-gray-400'
                  } relative inline-flex h-4 w-8 items-center rounded-full`}
                >
                  <span
                    className={`${
                      isMarginEnabled ? 'translate-x-4' : ''
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
              <div className='mb-1 flex justify-between'>
                <p>Borrow</p>
                <p>{isMarginEnabled ? 'BORROW VALUE' : '-'}</p>
              </div>
              <div className='flex justify-between'>
                <p>Borrow Rate</p>
                <p>{isMarginEnabled ? `${(borrowRate * 100).toFixed(2)}%` : '-'}</p>
              </div>
            </div>
            <div className='h-[100px] p-2'>
              <div className='mb-6'>OTHER INFO PLACEHOLDER</div>
              <div className='flex justify-between'>
                <p>Funded From</p>
                <select
                  value={fundingMode}
                  className='text-black'
                  onChange={handleFundingModeChange}
                >
                  <option value={FundingMode.CreditAccount}>Account</option>
                  <option value={FundingMode.Wallet}>Wallet</option>
                  <option value={FundingMode.Both}>Wallet & Account</option>
                </select>
              </div>
            </div>
            <Button className='w-full' onClick={() => mutate()} disabled={submitDisabled}>
              Create Order
            </Button>
          </Container>
          <Container>Orderbook module (optional)</Container>
        </div>
      </div>
      <Container>Trader order overview</Container>
    </div>
  )
}

export default Trade
