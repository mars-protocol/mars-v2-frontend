import Text from 'components/common/Text'
import useManagedVaultOwnerInfo from 'hooks/managedVaults/useManagedVaultOwnerInfo'
import Image from 'next/image'
import { truncate } from 'utils/formatters'

interface Props {
  address: string
}

export default function UserAddress(props: Props) {
  const { address } = props
  const { vaultOwnerInfo, isLoading: isOwnerInfoLoading } = useManagedVaultOwnerInfo(address)

  return (
    <div className='flex items-center gap-2'>
      <span className='h-8 w-8'>
        <Image
          src={vaultOwnerInfo.avatar.url}
          alt={vaultOwnerInfo.name}
          width={vaultOwnerInfo.avatar.width}
          height={vaultOwnerInfo.avatar.height}
          className='rounded-full w-8 h-8'
        />
      </span>
      <div className='flex flex-col gap-0.5'>
        <Text size='xs' className='inline-block text-white/60 bg-white/10 rounded px-1.5 py-0.5'>
          {isOwnerInfoLoading ? truncate(address, [2, 6]) : vaultOwnerInfo.name}
        </Text>
      </div>
    </div>
  )
}
