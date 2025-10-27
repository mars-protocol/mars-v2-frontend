import classNames from 'classnames'

import useAccountStrategiesColumns from 'components/account/AccountStrategiesTable/Columns/useAccountStrategiesColumns'
import useAccountStrategiesData from 'components/account/AccountStrategiesTable/useAccountStrategiesData'
import Table from 'components/common/Table'
import useStore from 'store'

interface Props {
  account: Account
  hideCard?: boolean
  tableBodyClassName?: string
}

export default function AccountStrategiesTable(props: Props) {
  const { account, tableBodyClassName, hideCard } = props
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountStrategiesData = useAccountStrategiesData({
    account,
    updatedAccount,
  })

  const columns = useAccountStrategiesColumns()

  if (accountStrategiesData.length === 0) return null

  return (
    <Table
      title='Strategies'
      columns={columns}
      data={accountStrategiesData}
      tableBodyClassName={classNames(tableBodyClassName, 'text-white/60')}
      initialSorting={[]}
      spacingClassName='px-4 py-2.5'
      hideCard={hideCard}
      type='strategies'
      isBalancesTable
    />
  )
}
