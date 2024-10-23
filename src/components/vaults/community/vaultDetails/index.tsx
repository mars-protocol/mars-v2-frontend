import classNames from 'classnames'
import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'

interface Props {}

export default function VaultDetails(props: Props) {
  return (
    <div className={classNames('h-screen-full md:min-h-[600px] w-screen-full md:w-180 max-w-full')}>
      <div className='relative flex flex-wrap justify-center w-full gap-4'>
        <Withdrawals />
        <VaultSummary />
      </div>
    </div>
  )
}
