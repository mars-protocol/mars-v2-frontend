import { VaultStatus } from 'types/enums'
import UnlockTime from 'components/earn/farm/common/Table/Columns/UnlockTime'

export default function Status({ row }: { row: PerpsVaultRow }) {
  return (
    <span className='text-xs inline-flex items-center gap-2 text-white/60'>
      {row.status === VaultStatus.ACTIVE && 'Active'}
      {row.status === VaultStatus.UNLOCKING && (
        <>
          Unlocking
          <span className='text-white/40'>•</span>
          {row.unlocksAt && <UnlockTime unlocksAt={row.unlocksAt} />}
        </>
      )}
      {row.status === VaultStatus.UNLOCKED && 'Unlocked'}
    </span>
  )
}
