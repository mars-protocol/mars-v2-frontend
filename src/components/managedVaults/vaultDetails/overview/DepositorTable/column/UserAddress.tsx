import Text from 'components/common/Text'
import useManagedVaultOwnerInfo from 'hooks/managedVaults/useManagedVaultOwnerInfo'
import useManagedVaultOwnerPosition from 'hooks/managedVaults/useManagedVaultOwnerPosition'
import Image from 'next/image'
import { truncate } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  address: string
  vaultAddress?: string
  ownerAddress?: string
}

export default function UserAddress(props: Props) {
  const { address, vaultAddress, ownerAddress } = props
  const { vaultOwnerInfo, isLoading: isOwnerInfoLoading } = useManagedVaultOwnerInfo(address)
  const { data: ownerPosition } = useManagedVaultOwnerPosition(vaultAddress || '', address)

  // Check if owner has holdings (shares > 0)
  const isOwner = ownerAddress && address === ownerAddress
  const hasHoldings = isOwner && ownerPosition?.shares && BN(ownerPosition.shares).isGreaterThan(0)

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
        <div className='flex items-center gap-1.5'>
          <Text size='xs' className='inline-block text-white/60 bg-white/10 rounded px-1.5 py-0.5'>
            {isOwnerInfoLoading ? truncate(address, [2, 6]) : vaultOwnerInfo.name}
          </Text>
          {hasHoldings && (
            <Text
              size='xs'
              tag='div'
              className='px-1.5 py-0.5 rounded-sm flex items-center justify-center text-success bg-success/20'
            >
              Vault Owner
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}
