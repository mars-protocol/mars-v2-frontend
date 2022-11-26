import { Dialog, Switch, Transition } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import useLocalStorageState from 'use-local-storage-state'

import Slider from 'components/Slider'
import useDepositCreditAccount from 'hooks/mutations/useDepositCreditAccount'
import useAllBalances from 'hooks/useAllBalances'
import useAllowedCoins from 'hooks/useAllowedCoins'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import Button from 'components/Button'
import ContainerSecondary from 'components/ContainerSecondary'
import CircularProgress from 'components/CircularProgress'

const FundAccountModal = ({ show, onClose }: any) => {
  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState('')

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const [lendAssets, setLendAssets] = useLocalStorageState(`lendAssets_${selectedAccount}`, {
    defaultValue: false,
  })

  const { data: balancesData } = useAllBalances()
  const { data: allowedCoinsData, isLoading: isLoadingAllowedCoins } = useAllowedCoins()
  const { mutate, isLoading } = useDepositCreditAccount(
    selectedAccount || '',
    selectedToken,
    BigNumber(amount)
      .times(10 ** getTokenDecimals(selectedToken))
      .toNumber(),
    {
      onSuccess: () => {
        setAmount(0)
        toast.success(`${amount} ${getTokenSymbol(selectedToken)} successfully Deposited`)
        onClose()
      },
    },
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
                    Fund Account {selectedAccount}
                  </Dialog.Title>
                  <ContainerSecondary className='mb-2 p-3'>
                    <p className='mb-6 text-sm text-[#585A74]/50'>
                      Transfer assets from your injective wallet to your Mars credit account. If you
                      don’t have any assets in your injective wallet use the injective bridge to
                      transfer funds to your injective wallet.
                    </p>
                    {isLoadingAllowedCoins ? (
                      <p>Loading...</p>
                    ) : (
                      <>
                        <div className='mb-2 rounded-md border border-[#585A74] text-sm'>
                          <div className='mb-1 flex justify-between border-b border-[#585A74] p-2'>
                            <div className='font-bold'>Asset:</div>
                            <select
                              className='bg-transparent outline-0'
                              onChange={(e) => {
                                setSelectedToken(e.target.value)

                                if (e.target.value !== selectedToken) setAmount(0)
                              }}
                              value={selectedToken}
                            >
                              {allowedCoinsData?.map((entry) => (
                                <option key={entry} value={entry}>
                                  {getTokenSymbol(entry)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className='flex justify-between p-2'>
                            <div className='font-bold'>Amount:</div>
                            <input
                              type='number'
                              className='bg-transparent text-right outline-0'
                              value={amount}
                              min='0'
                              onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                              onBlur={(e) => {
                                if (e.target.value === '') setAmount(0)
                              }}
                            />
                          </div>
                        </div>
                        <p className='mb-2 text-sm'>In wallet: {walletAmount.toLocaleString()}</p>
                        <Slider
                          className='mb-6'
                          value={percentageValue}
                          onChange={(value) => {
                            const decimal = value[0] / 100
                            const tokenDecimals = getTokenDecimals(selectedToken)
                            // limit decimal precision based on token contract decimals
                            const newAmount = Number((decimal * maxValue).toFixed(tokenDecimals))

                            setAmount(newAmount)
                          }}
                          onMaxClick={() => setAmount(maxValue)}
                        />
                      </>
                    )}
                  </ContainerSecondary>
                  <ContainerSecondary className='mb-2 flex items-center justify-between'>
                    <div>
                      <h3 className='font-bold'>Lending Assets</h3>
                      <div className='text-sm text-[#585A74]/50'>
                        Lend assets from account to earn yield.
                      </div>
                    </div>

                    <Switch
                      checked={lendAssets}
                      onChange={setLendAssets}
                      className={`${
                        lendAssets ? 'bg-blue-600' : 'bg-gray-400'
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span
                        className={`${
                          lendAssets ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </ContainerSecondary>
                  <Button
                    className='mt-auto w-full'
                    onClick={() => mutate()}
                    disabled={amount === 0 || !amount}
                  >
                    Fund Account
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

export default FundAccountModal
