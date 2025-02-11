import EditDescription from 'components/managedVaults/community/vaultDetails/common/Overlays/EditDescription'
import FeeAction from 'components/managedVaults/community/vaultDetails/common/Overlays/FeeAction'
import NavigationBackButton from 'components/common/Button/NavigationBackButton'
import PositionInfo from 'components/managedVaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/managedVaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import Text from 'components/common/Text'
import useToggle from 'hooks/common/useToggle'
import VaultAction from 'components/managedVaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultSummary from 'components/managedVaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/managedVaults/community/vaultDetails/Withdrawals'
import { ArrowDownLine } from 'components/common/Icons'
import { Callout, CalloutType } from 'components/common/Callout'
import { CircularProgress } from 'components/common/CircularProgress'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useParams } from 'react-router-dom'
import { useState } from 'react'

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

function VaultDetailsContent({ vaultAddress }: { vaultAddress: string }) {
  const { details: vaultDetails, isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  const [showEditDescriptionModal, setShowEditDescriptionModal] = useToggle()
  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()

  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null)
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw' | null>(null)

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }
  // TODO: fetch from contract
  const hasAccumulatedFees = false

  const handleActionModal = (type: 'deposit' | 'withdraw') => {
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
          isOwner={isOwner}
          wallet={vaultDetails.owner}
          onDelete={() => console.log('Delete clicked')}
          onEdit={() => setShowEditDescriptionModal(true)}
        />
      </div>

      <EditDescription
        showEditDescriptionModal={showEditDescriptionModal}
        setShowEditDescriptionModal={setShowEditDescriptionModal}
        description={vaultDetails?.description ?? ''}
      />

      <FeeAction
        showFeeActionModal={showFeeActionModal}
        setShowFeeActionModal={setShowFeeActionModal}
        type={modalFeeType || 'edit'}
        vaultAddress={vaultAddress!}
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
          {/* conditional message warning */}
          {!isOwner && (
            <Callout type={CalloutType.WARNING} className='w-full'>
              The vault does not have enough USDC to service withdrawals and cannot borrow funds due
              to a low health factor. Please contact the vault owner to resolve.
            </Callout>
          )}

          {isOwner ? (
            <PositionInfo
              value={Number(vaultDetails.performance_fee_state.accumulated_fee)}
              subtitle={
                <FormattedNumber
                  amount={Number(vaultDetails?.performance_fee_config.fee_rate ?? 0) * 100000}
                  options={{
                    suffix: '%',
                    minDecimals: 0,
                    maxDecimals: 0,
                    abbreviated: false,
                  }}
                  className='text-xs text-white/60'
                />
              }
              primaryButton={{
                text: 'Edit Fee',
                color: 'secondary',
                onClick: () => handleFeeActionModal('edit'),
                disabled: !hasAccumulatedFees,
              }}
              secondaryButton={{
                text: 'Withdraw',
                onClick: () => handleFeeActionModal('withdraw'),
                rightIcon: <ArrowDownLine />,
                disabled: !hasAccumulatedFees,
              }}
              isOwner={isOwner}
            />
          ) : (
            <PositionInfo
              value={149087}
              subtitle={
                <FormattedNumber
                  amount={3}
                  options={{
                    suffix: '% of the vault',
                    minDecimals: 0,
                    maxDecimals: 0,
                    abbreviated: false,
                  }}
                  className='text-xs text-white/60'
                />
              }
              primaryButton={{
                text: 'Deposit',
                onClick: () => handleActionModal('deposit'),
              }}
              secondaryButton={{
                text: 'Withdraw',
                color: 'secondary',
                onClick: () => handleActionModal('withdraw'),
                rightIcon: <ArrowDownLine />,
              }}
              isOwner={isOwner}
            />
          )}

          <Withdrawals details={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress!} />
          <VaultSummary details={vaultDetails} />
        </div>
      </div>
    </div>
  )
}
