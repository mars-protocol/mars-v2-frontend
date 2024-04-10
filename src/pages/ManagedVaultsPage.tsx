import React, { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import Button from 'components/common/Button'
import Card from 'components/common/Card'
import useAsset from 'hooks/assets/useAsset'
import useWalletBalances from 'hooks/useWalletBalances'
import useArbVault from 'hooks/vaults/useArbVault'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { getRoute } from 'utils/route'

import AssetImage from '../components/common/assets/AssetImage'
import DisplayCurrency from '../components/common/DisplayCurrency'
import { AccountArrowDown, Plus } from '../components/common/Icons'
import Loading from '../components/common/Loading'
import useAccountId from '../hooks/useAccountId'
import { BNCoin } from '../types/classes/BNCoin'

export default function ManagedVaultsPage() {
  const { data: managedVaults } = useArbVault()

  return (
    <div className='grid grid-cols-3 gap-6 w-full'>
      {managedVaults ? (
        managedVaults.map((vault) => <ManagedVaultCard key={vault.address} vault={vault} />)
      ) : (
        <Skeleton count={3} />
      )}
      {}
    </div>
  )
}

type ManagedVaultCardProps = {
  vault: ManagedVault
}

function ManagedVaultCard(props: ManagedVaultCardProps) {
  const asset = useAsset(props.vault.baseDenom)
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)

  const depositedCoin = useMemo(() => {
    const walletBalance = walletBalances?.find(
      (balance) => balance.denom === props.vault.vaultDenom,
    )
    if (!walletBalance) return null

    return BNCoin.fromDenomAndBigNumber(
      props.vault.baseDenom,
      BN(walletBalance.amount)
        .div(props.vault.vaultTokenSupply)
        .times(props.vault.tvl.amount)
        .integerValue(),
    )
  }, [
    props.vault.baseDenom,
    props.vault.tvl.amount,
    props.vault.vaultDenom,
    props.vault.vaultTokenSupply,
    walletBalances,
  ])

  const selectedAccountId = useAccountId()
  const accountId = useAccountId()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onClickCard = useCallback(() => {
    if (!accountId) return null

    const route = getRoute('vaults', searchParams, address, selectedAccountId, props.vault.address)
    navigate(route)
    return null
  }, [accountId, address, navigate, props.vault.address, searchParams, selectedAccountId])

  if (!asset) return null

  return (
    <Card
      className='p-4 bg-white/5 w-full cursor-pointer hover:bg-white/10 transition-all duration-200'
      contentClassName='gap-6 flex flex-col justify-between h-full'
      onClick={onClickCard}
    >
      <div className='flex gap-8 items-start w-full justify-between'>
        <div className='flex flex-col items-start gap-1'>
          <span className='text-white/60 text-xs'>Account #{props.vault.accountId}</span>
          <div>{props.vault.title ? props.vault.title : <p>Managed vault </p>}</div>
          <p className='text-white/60 text-sm'>{props.vault.subtitle}</p>
          <p className='text-white/60 text-xs'>{props.vault.description}</p>
        </div>

        <div className='w-10 mt-2'>
          <AssetImage asset={asset} />
        </div>
      </div>

      {/*<Divider />*/}
      <div className='flex gap-2 justify-around'>
        {depositedCoin && (
          <div className='flex flex-col gap-2 items-center'>
            <p className='text-white/60 text-xs'>Your deposits</p>
            <DisplayCurrency coin={depositedCoin} />
          </div>
        )}
        <div className='flex flex-col gap-2 items-center'>
          <p className='text-white/60 text-xs'>TVL</p>
          <DisplayCurrency coin={props.vault.tvl} />
        </div>
        <div className='flex flex-col gap-2 items-center'>
          <p className='text-white/60 text-xs'>APY</p>
          <p className=''>{props.vault.apy ? props.vault.apy.toFixed(2) + '%' : '-'}</p>
        </div>
      </div>
      <div className='flex gap-4'>
        {depositedCoin && (
          <Button
            color='secondary'
            className='w-full'
            leftIcon={<AccountArrowDown />}
            onClick={(e) => {
              e.stopPropagation()
              useStore.setState({ managedVaultModal: { type: 'withdraw', vault: props.vault } })
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
          onClick={(e) => {
            e.stopPropagation()
            console.log('opening modal')
            useStore.setState({ managedVaultModal: { type: 'deposit', vault: props.vault } })
          }}
        >
          Deposit
        </Button>
      </div>
    </Card>
  )
}

type Props = {
  count: number
}

function Skeleton(props: Props) {
  return (
    <>
      {[0, 1, 2, 3].map((_, i) => (
        <Card key={i} className='h-[200px] p-6 gap-6'>
          <Loading className='h-4 w-10 mb-6' />
          <Loading className='h-5 w-20 mb-6' />
          <div className='flex justify-around mb-6'>
            <Loading className='h-5 w-12' />
            <Loading className='h-5 w-12' />
            <Loading className='h-5 w-12' />
          </div>
          <Loading className='h-5 w-full' />
        </Card>
      ))}
    </>
  )
}
