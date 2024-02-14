import React from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import useStore from 'store'

interface Props {
  vault: Vault | DepositedVault
  isLoading: boolean
}

export const DEPOSIT_META = { accessorKey: 'deposit', enableSorting: false, header: '' }

export const Deposit = (props: Props) => {
  const { vault } = props

  function enterVaultHandler() {
    useStore.setState({
      vaultModal: {
        vault,
        selectedBorrowDenoms: [vault.denoms.secondary],
        isCreate: true,
      },
    })
  }

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton
        onClick={enterVaultHandler}
        color='tertiary'
        text='Deposit'
        leftIcon={<Plus />}
      />
    </div>
  )
}
