import Image from 'next/image'
import Loading from 'components/common/Loading'
import useManagedVaultOwnerInfo from 'hooks/managedVaults/useManagedVaultOwnerInfo'
import Text from 'components/common/Text'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'

export const TITLE_META = {
  accessorKey: 'title',
  header: 'Vault Title',
  meta: { className: 'max-w-60' },
}

interface Props {
  value: ManagedVaultWithDetails
  isLoading: boolean
}

export default function Title(props: Props) {
  const { value, isLoading } = props
  const { details: vaultDetails, isLoading: isDetailsLoading } = useManagedVaultDetails(
    value.vault_address,
  )
  const { vaultOwnerInfo, isLoading: isOwnerInfoLoading } = useManagedVaultOwnerInfo(
    vaultDetails?.ownerAddress,
  )

  if (isLoading || isDetailsLoading || isOwnerInfoLoading) return <Loading className='h-4 w-35' />

  return (
    <div className='flex items-center gap-2'>
      <span className='h-8 w-8'>
        <Image
          src={vaultOwnerInfo.avatar.url}
          alt={vaultOwnerInfo.name}
          width={vaultOwnerInfo.avatar.width}
          height={vaultOwnerInfo.avatar.height}
          className='rounded-full'
        />
      </span>
      <div className='flex flex-col gap-0.5'>
        <Text size='xs'>{value.title}</Text>
        <div>
          <Text size='xs' className='inline-block text-white/60 bg-white/10 rounded px-1.5 py-0.5'>
            {vaultOwnerInfo.name}
          </Text>
        </div>
      </div>
    </div>
  )
}
