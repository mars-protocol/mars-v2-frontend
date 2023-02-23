'use client'

import { Switch } from '@headlessui/react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { MarsProtocol } from 'components/Icons'
import { Modal } from 'components/Modal'
import { Slider } from 'components/Slider'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import getAllowedCoins from 'libs/getAllowedCoins'
import getUserBalances from 'libs/getUserBalances'
import useStore from 'store'
import useSWR from 'swr'
import { getMarketAssets } from 'utils/assets'
import { hardcodedFee } from 'utils/contants'
import { convertFromGwei, convertToGwei } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

export const FundAccountModal = () => {
  // ---------------
  // STORE
  // ---------------
  const open = useStore((s) => s.fundAccountModal)
  const params = useParams()
  const depositCreditAccount = useStore((s) => s.depositCreditAccount)
  const address = useStore((s) => s.client?.recentWallet.account?.address)
  const { data: balancesData, isLoading: balanceIsLoading } = useSWR(address, getUserBalances)
  const { data: allowedCoinsData, isLoading: allowedCoinsIsLoading } = useSWR(
    'allowed-coins',
    getAllowedCoins,
  )

  const selectedAccount = useStore((s) => s.selectedAccount)
  const marketAssets = getMarketAssets()
  const [lendAssets, setLendAssets] = useState(false)
  // ---------------
  // LOCAL STATE
  // ---------------
  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState('')

  // ---------------
  // FUNCTIONS
  // ---------------
  async function depositAccountHandler() {
    if (!selectedToken) return
    const deposit = {
      amount: convertToGwei(amount, selectedToken, marketAssets).toString(),
      denom: selectedToken,
    }
    const isSuccess = await depositCreditAccount({
      fee: hardcodedFee,
      accountId: params.account,
      deposit,
    })
    if (isSuccess) {
      useStore.setState({ fundAccountModal: false })
    }
  }

  useEffect(() => {
    if (!allowedCoinsData || !balancesData || selectedToken !== '') return
    let found = false
    allowedCoinsData.map((coinDenom) => {
      if (found) return
      if (balancesData?.find((balance) => balance.denom === coinDenom)?.amount ?? 0 > 0) {
        setSelectedToken(coinDenom)
        found = true
      }
    })
  }, [allowedCoinsData, balancesData])

  // ---------------
  // VARIABLES
  // ---------------
  const walletAmount = useMemo(() => {
    if (!selectedToken) return 0
    const walletAmount =
      balancesData?.find((balance) => balance.denom === selectedToken)?.amount ?? 0
    return convertFromGwei(walletAmount, selectedToken, marketAssets)
  }, [balancesData, selectedToken, marketAssets])

  const handleValueChange = (value: number) => {
    if (value > walletAmount) {
      setAmount(walletAmount)
      return
    }

    setAmount(value)
  }

  const setOpen = (open: boolean) => {
    useStore.setState({ fundAccountModal: open })
  }

  const percentageValue = isNaN(amount) ? 0 : (amount * 100) / walletAmount

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className='flex min-h-[520px] w-full'>
        {balanceIsLoading && (
          <div className='absolute inset-0 z-40 grid place-items-center bg-black/50'>
            <CircularProgress />
          </div>
        )}

        <div className='flex flex-1 flex-col items-start justify-between bg-fund-modal bg-cover p-6'>
          <div>
            <Text size='2xs' uppercase className='mb-3  text-white'>
              Fund
            </Text>
            <Text size='lg' className='mb-4 text-white'>
              Fund your Account to enable its borrowing and lending capabilities.
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
              Transfer assets from your osmosis wallet to your Mars credit account. If you don’t
              have any assets in your osmosis wallet use the osmosis bridge to transfer funds to
              your osmosis wallet.
            </Text>
            {allowedCoinsIsLoading ? (
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
                      {allowedCoinsData?.map((entry) => {
                        const entrySymbol = getTokenSymbol(entry, marketAssets)
                        return (
                          entrySymbol !== '' && (
                            <option key={entry} value={entry}>
                              {getTokenSymbol(entry, marketAssets)}
                            </option>
                          )
                        )
                      })}
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
              </>
            )}
            <Text size='xs' uppercase className='mb-2 text-white/60'>
              {`In wallet: ${walletAmount.toLocaleString()} ${getTokenSymbol(
                selectedToken,
                marketAssets,
              )}`}
            </Text>
            <Slider
              className='mb-6'
              value={percentageValue}
              onChange={(value) => {
                const decimal = value[0] / 100
                const tokenDecimals = getTokenDecimals(selectedToken, marketAssets)
                // limit decimal precision based on token contract decimals
                const newAmount = Number((decimal * walletAmount).toFixed(tokenDecimals))

                setAmount(newAmount)
              }}
              onMaxClick={() => setAmount(walletAmount)}
            />
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
                } inline-block h-4 w-4 transform rounded-full bg-white`}
              />
            </Switch>
          </div>
          <Button
            className='mt-auto w-full'
            onClick={depositAccountHandler}
            disabled={amount === 0 || !amount}
          >
            Fund Account
          </Button>
        </div>
      </div>
    </Modal>
  )
}
