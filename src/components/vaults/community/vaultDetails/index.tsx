import classNames from 'classnames'
import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'
import PositionInfo from 'components/vaults/community/vaultDetails/common/PositionInfo'
import { ArrowDownLine } from 'components/common/Icons'
import useStore from 'store'

export default function VaultDetails() {
  const address = useStore((s) => s.address)

  return (
    <div className={classNames('h-screen-full md:min-h-[600px] w-screen-full md:w-180 max-w-full')}>
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
  )
}
