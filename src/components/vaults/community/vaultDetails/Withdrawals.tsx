import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useQueuedWithdrawals from 'components/vaults/community/vaultDetails/table/useQueuedWithdrawals'
import { queuedWithdrawDummyData } from 'components/vaults/dummyData'

export default function Withdrawals() {
  const columns = useQueuedWithdrawals({ isLoading: false })

  const tabs: CardTab[] = [
    {
      title: 'Withdrawal Summary',
      renderContent: () => (
        <div className=''>
          <Text>working</Text>
        </div>
      ),
    },
    {
      title: 'Queued Withdrawals',
      renderContent: () => (
        <Table
          title='Queued Summary'
          hideCard
          columns={columns}
          data={queuedWithdrawDummyData}
          initialSorting={[]}
        />
      ),
    },
  ]
  return <CardWithTabs tabs={tabs} />
}
