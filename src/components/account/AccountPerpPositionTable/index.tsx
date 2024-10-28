import classNames from 'classnames'

import useAccountPerpsColumns from 'components/account/AccountPerpPositionTable/Columns/useAccountPerpsColumns'
import useAccountPerpData from 'components/account/AccountPerpPositionTable/useAccountPerpData'
import Table from 'components/common/Table'
import useStore from 'store'

interface Props {
  account: Account
  tableBodyClassName?: string
  showLiquidationPrice?: boolean
  hideCard?: boolean
}

export default function AccountPerpPositionTable(props: Props) {
  const { account, tableBodyClassName, showLiquidationPrice, hideCard } = props
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountPerpData = useAccountPerpData({
    account,
    updatedAccount,
  })

  const columns = useAccountPerpsColumns(account)

  return (
    <Table
      title='Perp Positions'
      columns={columns}
      data={accountPerpData}
      tableBodyClassName={classNames(tableBodyClassName, 'text-white/60')}
      initialSorting={[]}
      spacingClassName='p-2'
      hideCard={hideCard}
      type='perps'
      isBalancesTable
    />
  )
}
