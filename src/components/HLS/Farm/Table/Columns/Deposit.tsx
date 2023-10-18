import React from 'react'

import ActionButton from 'components/Button/ActionButton'
import Loading from 'components/Loading'

export const DEPOSIT_META = { accessorKey: 'deposit', header: 'Deposit' }

interface Props {
  vault: Vault
  isLoading: boolean
}

export default function Deposit(props: Props) {
  const { vault } = props

  function enterVaultHandler() {
    return
  }

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton onClick={enterVaultHandler} color='tertiary' text='Deposit' />
    </div>
  )
}
