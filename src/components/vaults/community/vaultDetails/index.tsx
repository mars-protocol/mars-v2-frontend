import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'
import PositionInfo from 'components/vaults/community/vaultDetails/common/PositionInfo'
import { ArrowDownLine } from 'components/common/Icons'
import useStore from 'store'
import ProfileVaultCard from './ProfileVaultCard'
import { vaultProfileData } from 'components/vaults/dummyData'

export default function VaultDetails() {
  // temp solution
  const address = useStore((s) => s.address)

  return (
    <div className='flex gap-4 justify-center h-screen-full md:min-h-[600px] w-screen-full'>
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
          onEdit={() => console.log('Edit clicked')}
          onDelete={() => console.log('Delete clicked')}
        />
      </div>
      <div className='md:w-180'>
        <div className='relative flex flex-wrap justify-center w-full gap-4'>
          {/* // TODO: fetch from contract */}
          {/* temp: if address - owner of the vault : user who deposited into vault */}
          {address ? (
            <PositionInfo
              title='Performance Fee'
              value={500.38}
              subtext='1% Fee'
              withdraw={true}
              primaryButton={{
                text: 'Withdraw',
                onClick: () => console.log('Withdraw clicked'),
                rightIcon: <ArrowDownLine />,
              }}
              secondaryButton={{
                text: 'Edit Fee',
                onClick: () => console.log('Edit Fee clicked'),
                disabled: true,
              }}
            />
          ) : (
            <PositionInfo
              title='My Position'
              value={149087}
              subtext='2% of total vault'
              primaryButton={{
                text: 'Deposit',
                onClick: () => console.log('Deposit clicked'),
              }}
              secondaryButton={{
                text: 'Withdraw',
                onClick: () => console.log('Withdraw clicked'),
                rightIcon: <ArrowDownLine />,
              }}
            />
          )}
          <Withdrawals />
          <VaultSummary />
        </div>
      </div>
    </div>
  )
}
