import { Switch } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import useLocalStorageState from 'use-local-storage-state'

import { Button, CircularProgress, Modal, Slider, Text } from 'components'
import { MarsProtocol } from 'components/Icons'
import { useAllBalances, useAllowedCoins } from 'hooks'
import { useDepositCreditAccount } from 'hooks/mutations'
import { useAccountDetailsStore, useModalStore } from 'stores'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

export const FundAccountModal = () => {
  // ---------------
  // STORE
  // ---------------
  const open = useModalStore((s) => s.fundAccountModal)

  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)
  const [lendAssets, setLendAssets] = useLocalStorageState(`lendAssets_${selectedAccount}`, {
    defaultValue: false,
  })

  // ---------------
  // LOCAL STATE
  // ---------------
  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState('')

  // ---------------
  // EXTERNAL HOOKS
  // ---------------
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
        useModalStore.setState({ fundAccountModal: false })
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

  const setOpen = (open: boolean) => {
    useModalStore.setState({ fundAccountModal: open })
  }

  const maxValue = walletAmount
  const percentageValue = isNaN(amount) ? 0 : (amount * 100) / maxValue

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className='flex min-h-[520px] w-full'>
        {isLoading && (
          <div className='absolute inset-0 z-40 grid place-items-center bg-black/50'>
            <CircularProgress />
          </div>
        )}

        <div className='flex flex-1 flex-col items-start justify-between bg-fund-modal bg-cover p-6'>
          <div>
            <Text size='2xs' uppercase className='mb-3  text-white'>
              About
            </Text>
            <Text size='xl' className='mb-4 text-white'>
              Bringing the next generation of video creation to the Metaverse.
              <br />
              Powered by deep-learning.
            </Text>
          </div>
          <div className='w-[153px] text-white'>
            <MarsProtocol />
          </div>
        </div>

        <div className='flex flex-1 flex-col p-6'>
          <Text size='xl' uppercase className='mb-4 text-white'>
            Account {selectedAccount}
          </Text>
          <div className='p-3" mb-2'>
            <Text size='sm' uppercase className='mb-1 text-white'>
              Fund Account
            </Text>
            <Text size='sm' className='mb-6 text-white/60'>
              Transfer assets from your injective wallet to your Mars credit account. If you don’t
              have any assets in your injective wallet use the injective bridge to transfer funds to
              your injective wallet.
            </Text>
            {isLoadingAllowedCoins ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className='mb-4 rounded-md border border-white/20'>
                  <div className='mb-1 flex justify-between border-b border-white/20 p-2'>
                    <Text size='sm' className='text-white'>
                      Asset:
                    </Text>
                    <select
                      className='bg-transparent text-white outline-0'
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
                    <Text size='sm' className='text-white'>
                      Amount:
                    </Text>
                    <input
                      type='number'
                      className='appearance-none bg-transparent text-right text-white'
                      value={amount}
                      min='0'
                      onChange={(e) => handleValueChange(e.target.valueAsNumber)}
                      onBlur={(e) => {
                        if (e.target.value === '') setAmount(0)
                      }}
                    />
                  </div>
                </div>
                <Text size='xs' uppercase className='mb-2 text-white/60'>
                  {`In wallet: ${walletAmount.toLocaleString()} ${getTokenSymbol(selectedToken)}`}
                </Text>
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
          </div>
          <div className='mb-2 flex items-center justify-between'>
            <div>
              <Text size='sm' uppercase className='mb-1 text-white'>
                Lending Assets
              </Text>
              <Text size='sm' className='text-white/60'>
                Lend assets from account to earn yield.
              </Text>
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
          </div>
          <Button
            className='mt-auto w-full'
            onClick={() => mutate()}
            disabled={amount === 0 || !amount}
          >
            Fund Account
          </Button>
        </div>
      </div>
    </Modal>
  )
}
