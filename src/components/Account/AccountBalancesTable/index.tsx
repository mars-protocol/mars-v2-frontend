import classNames from 'classnames'
import { useLocation, useNavigate } from 'react-router-dom'

import useAccountBalancesColumns from 'components/Account/AccountBalancesTable/Columns/useAccountBalancesColumns'
import useAccountBalanceData from 'components/Account/AccountBalancesTable/useAccountBalanceData'
import AccountFundFullPage from 'components/Account/AccountFund/AccountFundFullPage'
import ActionButton from 'components/Button/ActionButton'
import Card from 'components/Card'
import Table from 'components/Table'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

interface Props {
  account: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
  hideCard?: boolean
  tableBodyClassName?: string
}

export default function AccountBalancesTable(props: Props) {
  const { account, lendingData, borrowingData, tableBodyClassName, hideCard } = props
  const currentAccount = useCurrentAccount()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountBalanceData = useAccountBalanceData({
    account,
    updatedAccount,
    lendingData,
    borrowingData,
  })

  const columns = useAccountBalancesColumns()

  if (accountBalanceData.length === 0)
    return (
      <ConditionalWrapper
        condition={!hideCard}
        wrapper={(children) => (
          <Card className='w-full' title='Balances'>
            {children}
          </Card>
        )}
      >
        <div className='w-full p-4'>
          <ActionButton
            className='w-full'
            text='Fund this Account'
            color='tertiary'
            onClick={() => {
              if (currentAccount?.id !== account.id) {
                navigate(getRoute(getPage(pathname), address, account.id))
              }
              useStore.setState({
                focusComponent: {
                  component: <AccountFundFullPage />,
                  onClose: () => {
                    useStore.setState({ getStartedModal: true })
                  },
                },
              })
            }}
          />
        </div>
      </ConditionalWrapper>
    )

  return (
    <Table
      title='Balances'
      isBalancesTable={true}
      columns={columns}
      data={accountBalanceData}
      tableBodyClassName={classNames(tableBodyClassName, 'text-white/60')}
      initialSorting={[]}
      spacingClassName='p-2'
      hideCard={hideCard}
    />
  )
}
