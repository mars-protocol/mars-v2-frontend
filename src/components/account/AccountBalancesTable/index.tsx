import classNames from 'classnames'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import useAccountBalancesColumns from 'components/account/AccountBalancesTable/Columns/useAccountBalancesColumns'
import useAccountBalanceData from 'components/account/AccountBalancesTable/useAccountBalanceData'
import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import ActionButton from 'components/common/Button/ActionButton'
import Card from 'components/common/Card'
import Table from 'components/common/Table'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

interface Props {
  account: Account
  isHls?: boolean
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
  hideCard?: boolean
  tableBodyClassName?: string
  showLiquidationPrice?: boolean
}

export default function AccountBalancesTable(props: Props) {
  const [searchParams] = useSearchParams()
  const {
    account,
    lendingData,
    borrowingData,
    tableBodyClassName,
    hideCard,
    showLiquidationPrice,
  } = props
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
    isHls: props.isHls,
  })

  const columns = useAccountBalancesColumns(account, showLiquidationPrice)

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
                navigate(getRoute(getPage(pathname), searchParams, address, account.id))
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
      columns={columns}
      data={accountBalanceData}
      tableBodyClassName={classNames(tableBodyClassName, 'text-white/60')}
      initialSorting={[]}
      spacingClassName='p-2'
      hideCard={hideCard}
      isBalancesTable
    />
  )
}
