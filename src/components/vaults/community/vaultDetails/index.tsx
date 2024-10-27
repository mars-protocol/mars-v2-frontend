import EditDescription from 'components/vaults/community/vaultDetails/common/Overlays/EditDescription'
import FeeAction from 'components/vaults/community/vaultDetails/common/Overlays/FeeAction'
import PositionInfo from 'components/vaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/vaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import VaultAction from 'components/vaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import useStore from 'store'
import useToggle from 'hooks/common/useToggle'
import { ArrowDownLine } from 'components/common/Icons'
import { useState } from 'react'
import { vaultProfileData } from 'components/vaults/dummyData'
import { Callout, CalloutType } from 'components/common/Callout'

export default function VaultDetails() {
  // temp solution
  const address = useStore((s) => s.address)
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useToggle()
  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()

  const [description, setDescription] = useState<string>(vaultProfileData.description)
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null)
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw' | null>(null)

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
      <div className='flex flex-col md:flex-row gap-4 justify-center relative'>
        <div className='md:w-100'>
          {/* TODO: fetch the data */}
          <ProfileVaultCard
            vaultName={vaultProfileData.vaultName}
            apr={vaultProfileData.apr}
            tvl={vaultProfileData.tvl}
            accuredPnl={vaultProfileData.accuredPnl}
            wallet={vaultProfileData.wallet}
            description={description}
            avatarUrl={vaultProfileData.avatarUrl}
            onDelete={() => console.log('Delete clicked')}
            onEdit={() => setShowEditDescriptionModal(true)}
            address={address}
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
        />

        <VaultAction
          showActionModal={showActionModal}
          setShowActionModal={setShowActionModal}
          type={modalType || 'deposit'}
        />

        <div className='md:w-180'>
          <div className='relative flex flex-wrap justify-center w-full gap-4'>
            {/* conditional message warning */}
            {!address && (
              <Callout type={CalloutType.WARNING} className='w-full'>
                The vault does not have enough USDC to service withdrawals and cannot borrow funds
                due to a low health factor. Please contact the vault owner to resolve.
              </Callout>
            )}

            {/* // TODO: update data that can be fetched */}
            {address ? (
              <PositionInfo
                value={500.38}
                subtitle='1% Fee'
                primaryButton={{
                  text: 'Edit Fee',
                  color: 'secondary',
                  onClick: () => handleFeeActionModal('edit'),
                  // TODO: conditional disable
                }}
                secondaryButton={{
                  text: 'Withdraw',
                  onClick: () => handleFeeActionModal('withdraw'),
                  rightIcon: <ArrowDownLine />,
                }}
                address={address}
              />
            ) : (
              <PositionInfo
                value={149087}
                subtitle='2% of total vault'
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
                address={''}
              />
            )}

            <Withdrawals />
            <VaultSummary />
          </div>
        </div>
      </div>
    </div>
  )
}