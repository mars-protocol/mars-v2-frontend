import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'
import PositionInfo from 'components/vaults/community/vaultDetails/common/PositionInfo'
import { ArrowDownLine } from 'components/common/Icons'
import useStore from 'store'
import ProfileVaultCard from 'components/vaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import { vaultProfileData } from 'components/vaults/dummyData'
import EditDescription from './profileVaultCard/EditDescription'
import useToggle from 'hooks/common/useToggle'
import { useState } from 'react'

export default function VaultDetails() {
  // temp solution
  const address = useStore((s) => s.address)
  const [showEditModal, setShowEditModal] = useToggle()
  const [description, setDescription] = useState(vaultProfileData.description)

  const handleUpdateDescription = (newDescription: string) => {
    setDescription(description)
    setShowEditModal(false)
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
            description={vaultProfileData.description}
            avatarUrl={vaultProfileData.avatarUrl}
            onDelete={() => console.log('Delete clicked')}
            onEdit={() => setShowEditModal(true)}
            address={address}
          />
        </div>
        <EditDescription
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          description={description}
          onUpdateDescription={handleUpdateDescription}
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
                  onClick: () => console.log('Edit Fee clicked'),
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
