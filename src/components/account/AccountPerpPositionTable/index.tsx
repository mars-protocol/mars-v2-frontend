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
  isBalancesTable?: boolean
}

export default function AccountPerpPositionTable(props: Props) {
  const {
    account,
    tableBodyClassName,
    showLiquidationPrice,
    hideCard,
    isBalancesTable = true,
  } = props
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountPerpData = useAccountPerpData({
    account,
    updatedAccount,
  })

  const columns = useAccountPerpsColumns({ account, isBalancesTable })

  return (
    <Table
      title='Perp Positions'
      columns={columns}
      data={accountPerpData}
      tableBodyClassName={classNames(tableBodyClassName, 'text-white/60')}
      initialSorting={[]}
      spacingClassName='px-4 py-2.5'
      hideCard={hideCard}
      type='perps'
      isBalancesTable
    />
  )
}
