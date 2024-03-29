import { ColumnDef } from '@tanstack/react-table'
import React from 'react'

import { LockLocked, LockUnlocked } from 'components/common/Icons'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import { VaultStatus } from 'types/enums/vault'

type Props = {
  data: DepositedVault[]
  columns: ColumnDef<DepositedVault>[]
  isLoading: boolean
  status: VaultStatus
}

export default function ActiveVaultsTable(props: Props) {
  if (props.data.length === 0) {
    return (
      <div className='flex flex-col items-center py-10 gap-1'>
        <div className='w-6 mb-2'>{iconAndTexts[props.status].icon}</div>
        <Text size='xs'>{iconAndTexts[props.status].title}</Text>
        <Text size='xs' className='text-white/60'>
          {iconAndTexts[props.status].description}
        </Text>
      </div>
    )
  }

  return (
    <Table
      hideCard
      title='Deposited Vaults'
      columns={props.columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}

const iconAndTexts = {
  [VaultStatus.ACTIVE]: {
    icon: <LockUnlocked />,
    title: 'No active positions',
    description: 'You currently have no active positions.',
  },
  [VaultStatus.UNLOCKED]: {
    icon: <LockUnlocked />,
    title: 'No unlocked positions',
    description: 'You currently have no unlocked positions.',
  },
  [VaultStatus.UNLOCKING]: {
    icon: <LockLocked />,
    title: 'No unlocking positions',
    description: 'You currently have no positions that are being unlocked.',
  },
}
