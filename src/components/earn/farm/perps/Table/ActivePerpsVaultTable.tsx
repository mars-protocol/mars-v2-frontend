import { ColumnDef } from '@tanstack/react-table'

import { LockLocked, LockUnlocked } from 'components/common/Icons'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import { VaultStatus } from 'types/enums'

type Props = {
  data: DepositedPerpsVault[]
  columns: ColumnDef<DepositedPerpsVault>[]
  isLoading: boolean
  status: VaultStatus
}

export default function ActivePerpsVaultTable(props: Props) {
  if (props.data.length === 0) {
    return (
      <div className='flex flex-col items-center gap-1 py-10'>
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
      title='Deposited Perp Vault Position'
      columns={props.columns}
      data={props.data}
      initialSorting={[{ id: 'name', desc: false }]}
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
