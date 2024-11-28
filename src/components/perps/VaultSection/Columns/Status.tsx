import { VaultStatus } from 'types/enums'

export default function Status({ row }: { row: PerpsVaultRow }) {
  return (
    <span className='text-xs text-white/60'>
      {row.status === VaultStatus.ACTIVE && 'Active'}
      {row.status === VaultStatus.UNLOCKING && 'Unlocking'}
      {row.status === VaultStatus.UNLOCKED && 'Unlocked'}
    </span>
  )
}
