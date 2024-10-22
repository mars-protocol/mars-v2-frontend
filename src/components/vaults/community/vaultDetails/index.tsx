import classNames from 'classnames'

import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'

interface Props {}

export default function VaultDetails(props: Props) {
  return (
    <div className={classNames('h-screen-full md:min-h-[600px] w-screen-full md:w-180 max-w-full')}>
      <div className='relative flex flex-wrap justify-center w-full pt-4'>
        <Withdrawals />
      </div>
    </div>
  )
}
