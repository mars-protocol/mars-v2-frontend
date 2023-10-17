import React from 'react'

import ActionButton from 'components/Button/ActionButton'
import Loading from 'components/Loading'
import useStore from 'store'

interface Props {
  vault: Vault | DepositedVault
  isLoading: boolean
}

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
      <ActionButton onClick={enterVaultHandler} color='tertiary' text='Deposit' />
    </div>
  )
}
