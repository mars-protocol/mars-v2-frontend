import React, { useEffect, useMemo, useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import BigNumber from 'bignumber.js'
import { Switch } from '@headlessui/react'

import Button from '../Button'
import useAllowedCoins from 'hooks/useAllowedCoins'
import useDepositCreditAccount from 'hooks/useDepositCreditAccount'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useAllBalances from 'hooks/useAllBalances'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import { ContainerStyled } from '.'

const FundAccount = () => {
  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState('')
  const [enabled, setEnabled] = useState(false)

  const selectedAccount = useCreditManagerStore((state) => state.selectedAccount)

  const { data: balancesData } = useAllBalances()
  const { data: allowedCoinsData, isLoading: isLoadingAllowedCoins } = useAllowedCoins()
  const { mutate } = useDepositCreditAccount(
    selectedAccount || '',
    selectedToken,
    BigNumber(amount)
      .times(10 ** getTokenDecimals(selectedToken))
      .toNumber()
  )

  useEffect(() => {
    if (allowedCoinsData && allowedCoinsData.length > 0) {
      // initialize selected token when allowedCoins fetch data is available
      setSelectedToken(allowedCoinsData[0])
    }
  }, [allowedCoinsData])

  const walletAmount = useMemo(() => {
    if (!selectedToken) return 0

    return BigNumber(balancesData?.find((balance) => balance.denom === selectedToken)?.amount ?? 0)
      .div(10 ** getTokenDecimals(selectedToken))
      .toNumber()
  }, [balancesData, selectedToken])

  const handleValueChange = (value: number) => {
    if (value > walletAmount) {
      setAmount(walletAmount)
      return
    }

    setAmount(value)
  }

  const maxValue = walletAmount
  const percentageValue = isNaN(amount) ? 0 : (amount * 100) / maxValue

  return (
    <>
      <ContainerStyled className="p-3 mb-2">
        <p className="mb-6">
          Transfer assets from your injective wallet to your Mars credit account. If you don’t have
          any assets in your injective wallet use the injective bridge to transfer funds to your
          injective wallet.
        </p>
        {isLoadingAllowedCoins ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <div>Asset:</div>
                <select
                  className="bg-transparent"
                  onChange={(e) => {
                    setSelectedToken(e.target.value)

                    if (e.target.value !== selectedToken) setAmount(0)
                  }}
                >
                  {allowedCoinsData?.map((entry) => (
                    <option key={entry} value={entry}>
                      {getTokenSymbol(entry)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <div>Amount:</div>
                <input
                  type="number"
                  className="bg-transparent border border-black/50 px-2"
                  value={amount}
                  onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                />
              </div>
            </div>
            <p>In wallet: {walletAmount.toLocaleString()}</p>
            {/* SLIDER - initial implementation to test functionality */}
            {/* TODO: will need to be revamped later on */}
            <div className="relative flex flex-1 mb-6 items-center">
              <Slider.Root
                className="relative flex h-[20px] w-full cursor-pointer touch-none select-none items-center"
                value={[percentageValue]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => {
                  const decimal = value[0] / 100
                  const tokenDecimals = getTokenDecimals(selectedToken)
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
                className="ml-4 py-1 px-2 text-sm bg-blue-600 text-white rounded-md"
                onClick={() => setAmount(maxValue)}
              >
                MAX
              </button>
            </div>
          </>
        )}
      </ContainerStyled>
      <ContainerStyled className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-bold">Lending Assets</h3>
          <div className="opacity-50">Lend assets from account to earn yield.</div>
        </div>

        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-400'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </ContainerStyled>
      <Button
        className="w-full !rounded-lg"
        onClick={() => mutate()}
        disabled={amount === 0 || !amount}
      >
        Fund
      </Button>
    </>
  )
}

export default FundAccount
