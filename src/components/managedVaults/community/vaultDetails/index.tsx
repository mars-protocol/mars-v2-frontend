import FeeAction from 'components/managedVaults/community/vaultDetails/common/Overlays/FeeAction'
import NavigationBackButton from 'components/common/Button/NavigationBackButton'
import ProfileVaultCard from 'components/managedVaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import OwnerVaultPosition from 'components/managedVaults/community/vaultDetails/OwnerVaultPosition'
import Text from 'components/common/Text'
import useToggle from 'hooks/common/useToggle'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import VaultPosition from 'components/managedVaults/community/vaultDetails/VaultPosition'
import VaultAction from 'components/managedVaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultSummary from 'components/managedVaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/managedVaults/community/vaultDetails/Withdrawals'
import { CircularProgress } from 'components/common/CircularProgress'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { byDenom } from 'utils/array'

function VaultLoadingState() {
  return (
    <div className='flex flex-wrap justify-center w-full gap-4'>
      <CircularProgress size={60} />
      <Text className='w-full text-center' size='2xl'>
        Fetching on-chain data...
      </Text>
    </div>
  )
}

export default function VaultDetails() {
  const { vaultAddress } = useParams<{ vaultAddress: string }>()

  if (!vaultAddress) {
    return <VaultLoadingState />
  }

  return (
    <div className='container mx-auto'>
      <div className='flex items-center mb-6'>
        <NavigationBackButton />
      </div>

      <VaultDetailsContent vaultAddress={vaultAddress} />
    </div>
  )
}

export function VaultDetailsContent({ vaultAddress }: { vaultAddress: string }) {
  const { details: vaultDetails, isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()
  const [modalType, setModalType] = useState<'deposit' | 'unlock'>('deposit')
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw'>('edit')
  const vaultAssets = useVaultAssets()

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }

  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_tokens_denom)) as Asset

  const handleActionModal = (type: 'deposit' | 'unlock') => {
    setModalType(type)
    setShowActionModal(true)
  }

  const handleFeeActionModal = (type: 'edit' | 'withdraw') => {
    setModalFeeType(type)
    setShowFeeActionModal(true)
  }

  if (!vaultDetails) return null

  return (
    <div className='flex flex-col justify-center gap-4 md:flex-row'>
      <div className='md:w-100'>
        <ProfileVaultCard
          details={vaultDetails}
          depositAsset={depositAsset}
          isOwner={isOwner}
          wallet={vaultDetails.owner}
        />
      </div>
      <FeeAction
        showFeeActionModal={showFeeActionModal}
        setShowFeeActionModal={setShowFeeActionModal}
        type={modalFeeType}
        vaultAddress={vaultAddress}
        depositAsset={depositAsset}
        vaultDetails={vaultDetails}
      />

      <VaultAction
        showActionModal={showActionModal}
        setShowActionModal={setShowActionModal}
        vaultDetails={vaultDetails}
        vaultAddress={vaultAddress!}
        type={modalType || 'deposit'}
      />

      <div className='md:w-180'>
        <div className='relative flex flex-wrap justify-center w-full gap-4'>
          {isOwner ? (
            <OwnerVaultPosition
              vaultDetails={vaultDetails}
              isOwner={isOwner}
              handleFeeActionModal={handleFeeActionModal}
              handleActionModal={handleActionModal}
              vaultAddress={vaultAddress}
            />
          ) : (
            // user vault position
            <VaultPosition
              details={vaultDetails}
              isOwner={isOwner}
              vaultAddress={vaultAddress}
              onDeposit={() => handleActionModal('deposit')}
              onWithdraw={() => handleActionModal('unlock')}
            />
          )}

          <Withdrawals details={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress!} />
          <VaultSummary details={vaultDetails} />
        </div>
      </div>
    </div>
  )
}
