import { Callout, CalloutType } from 'components/common/Callout'
import { CircularProgress } from 'components/common/CircularProgress'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowDownLine } from 'components/common/Icons'
import Text from 'components/common/Text'
import EditDescription from 'components/vaults/community/vaultDetails/common/Overlays/EditDescription'
import FeeAction from 'components/vaults/community/vaultDetails/common/Overlays/FeeAction'
import VaultAction from 'components/vaults/community/vaultDetails/common/Overlays/VaultAction'
import PositionInfo from 'components/vaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/vaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import { vaultProfileData } from 'components/vaults/dummyData'
import useToggle from 'hooks/common/useToggle'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

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

  return <VaultDetailsContent vaultAddress={vaultAddress} />
}

function VaultDetailsContent({ vaultAddress }: { vaultAddress: string | undefined }) {
  const { details: vaultDetails, isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  const [showEditDescriptionModal, setShowEditDescriptionModal] = useToggle()
  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()

  const [description, setDescription] = useState<string>(vaultDetails?.description || '')
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null)
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw' | null>(null)

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }
  // TODO: fetch from contract
  const hasAccumulatedFees = false

  const handleUpdateDescription = (newDescription: string) => {
    setDescription(newDescription)
    setShowEditDescriptionModal(false)
  }

  const handleActionModal = (type: 'deposit' | 'withdraw') => {
    setModalType(type)
    setShowActionModal(true)
  }

  const handleFeeActionModal = (type: 'edit' | 'withdraw') => {
    setModalFeeType(type)
    setShowFeeActionModal(true)
  }

  return (
    <div className='min-h-screen md:h-screen-full md:min-h-[600px] w-full'>
      <div className='relative flex flex-col justify-center gap-4 md:flex-row'>
        <div className='md:w-100'>
          <ProfileVaultCard
            details={vaultDetails}
            isOwner={isOwner}
            wallet={vaultProfileData.wallet}
            avatarUrl={vaultProfileData.avatarUrl}
            onDelete={() => console.log('Delete clicked')}
            onEdit={() => setShowEditDescriptionModal(true)}
          />
        </div>

        <EditDescription
          showEditDescriptionModal={showEditDescriptionModal}
          setShowEditDescriptionModal={setShowEditDescriptionModal}
          description={description}
          onUpdateDescription={handleUpdateDescription}
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
                The vault does not have enough USDC to service withdrawals and cannot borrow funds
                due to a low health factor. Please contact the vault owner to resolve.
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
            <VaultSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
