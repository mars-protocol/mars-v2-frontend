import classNames from 'classnames'

import useStore from '../../../store'
import Table from '../../common/Table'
import useAccountStrategiesColumns from './Columns/useAccountStrategiesColumns'
import useAccountStrategiesData from './useAccountStrategiesData'

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
      spacingClassName='p-2'
      hideCard={hideCard}
      type='strategies'
    />
  )
}
