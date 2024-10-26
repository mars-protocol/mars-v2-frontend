import EditDescription from 'components/vaults/community/vaultDetails/common/Overlays/EditDescription'
import EditPerformanceFee from 'components/vaults/community/vaultDetails/common/Overlays/EditPerformanceFee'
import PositionInfo from 'components/vaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/vaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import useStore from 'store'
import useToggle from 'hooks/common/useToggle'
import { ArrowDownLine } from 'components/common/Icons'
import { useState } from 'react'
import { vaultProfileData } from 'components/vaults/dummyData'

export default function VaultDetails() {
  // temp solution
  const address = useStore((s) => s.address)
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useToggle()
  const [showEditFeeModal, setShowEditFeeModal] = useToggle()
  const [description, setDescription] = useState<string>(vaultProfileData.description)

  const handleUpdateDescription = (newDescription: string) => {
    setDescription(newDescription)
    setShowEditDescriptionModal(false)
  }

  const handleUpdateFee = (newFee: string) => {
    // setDescription(newFee)
    setShowEditFeeModal(false)
  }

  return (
    <div className='h-screen-full md:min-h-[600px] w-screen-full'>
      {/* <div className='min-h-screen w-screen-full '> */}
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

        <EditPerformanceFee
          showEditFeeModal={showEditFeeModal}
          setShowEditFeeModal={setShowEditFeeModal}
        />

        <div className='md:w-180'>
          <div className='relative flex flex-wrap justify-center w-full gap-4'>
            {/* // TODO: update data that can be fetched */}
            {address ? (
              <PositionInfo
                value={500.38}
                subtitle='1% Fee'
                primaryButton={{
                  text: 'Edit Fee',
                  color: 'secondary',
                  onClick: () => setShowEditFeeModal(true),
                  // TODO: conditional disable
                }}
                secondaryButton={{
                  text: 'Withdraw',
                  onClick: () => console.log('Withdraw clicked'),
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
                  onClick: () => console.log('Deposit clicked'),
                }}
                secondaryButton={{
                  text: 'Withdraw',
                  color: 'secondary',
                  onClick: () => console.log('Withdraw clicked'),
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
