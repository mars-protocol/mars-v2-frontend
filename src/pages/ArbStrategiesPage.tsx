import React, { useMemo } from 'react'

import Button from 'components/common/Button'
import Card from 'components/common/Card'
import useAsset from 'hooks/assets/useAsset'
import useWalletBalances from 'hooks/useWalletBalances'
import useArbVault from 'hooks/vaults/useArbVault'
import useStore from 'store'
import { BN } from 'utils/helpers'

import AssetImage from '../components/common/assets/AssetImage'
import DisplayCurrency from '../components/common/DisplayCurrency'
import { AccountArrowDown, Plus } from '../components/common/Icons'
import { BNCoin } from '../types/classes/BNCoin'

export function ArbStrategiesPage() {
  const { data: arbVault } = useArbVault()
  const asset = useAsset(arbVault?.denoms.primary ?? '')
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)

  const depositedCoin = useMemo(() => {
    const walletBalance = walletBalances?.find(
      (balance) => balance.denom === arbVault?.denoms.vault,
    )
    if (!walletBalance || !arbVault) return null

    return BNCoin.fromDenomAndBigNumber(
      arbVault.denoms.primary,
      BN(walletBalance.amount)
        .div(arbVault.vaultTokenSupply)
        .times(arbVault.tvl.amount)
        .integerValue(),
    )
  }, [arbVault, walletBalances])

  if (!asset || !arbVault) return null

  return (
    <Card className='p-4 bg-white/5'>
      <div className='flex gap-8 items-center mb-6'>
        <div className='flex flex-col'>
          <p className='text-white/60 text-xs mt-2'>Hot off the presses</p>
          <div>
            Perps Funding Rate Bot{' '}
            <span className='text-white/60 text-sm'>- via {arbVault.provider}</span>
          </div>
        </div>

        <div className='w-10'>
          <AssetImage asset={asset} />
        </div>
      </div>

      <div className='flex mb-6 gap-2 justify-around'>
        {depositedCoin && (
          <div className='flex flex-col gap-2 items-center'>
            <p className='text-white/60 text-xs'>Your deposits</p>
            <DisplayCurrency coin={depositedCoin} />
          </div>
        )}
        <div className='flex flex-col gap-2 items-center'>
          <p className='text-white/60 text-xs'>TVL</p>
          <DisplayCurrency coin={arbVault.tvl} />
        </div>
        <div className='flex flex-col gap-2 items-center'>
          <p className='text-white/60 text-xs'>APY</p>
          <p className=''>60%</p>
        </div>
      </div>
      <div className='flex gap-4'>
        {depositedCoin && (
          <Button
            color='secondary'
            className='w-full'
            leftIcon={<AccountArrowDown />}
            onClick={() => {
              useStore.setState({ arbModal: { type: 'withdraw' } })
            }}
          >
            Withdraw
          </Button>
        )}
        <Button
          color='secondary'
          className='w-full'
          leftIcon={
            <div className='w-4'>
              <Plus />
            </div>
          }
          onClick={() => {
            console.log('opening modal')
            useStore.setState({ arbModal: { type: 'deposit' } })
          }}
        >
          Deposit
        </Button>
      </div>
    </Card>
  )
}
