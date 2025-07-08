import classNames from 'classnames'
import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import useAccountBalancesColumns from 'components/account/AccountBalancesTable/Columns/useAccountBalancesColumns'
import { VALUE_META } from 'components/account/AccountBalancesTable/Columns/Value'
import useAccountBalanceData from 'components/account/AccountBalancesTable/useAccountBalanceData'
import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import ActionButton from 'components/common/Button/ActionButton'
import Card from 'components/common/Card'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useAccountTitle from 'hooks/accounts/useAccountTitle'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useSkipBridge } from 'hooks/bridge/useSkipBridge'
import { useSkipBridgeData } from 'hooks/bridge/useSkipBridgeData'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

interface Props {
  account: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
  hideCard?: boolean
  tableBodyClassName?: string
  showLiquidationPrice?: boolean
  isUsersAccount?: boolean
  abbreviated?: boolean
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
    isUsersAccount,
    abbreviated = true,
  } = props
  const chainConfig = useChainConfig()
  const currentAccount = useCurrentAccount()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const isHls = account.kind === 'high_levered_strategy'

  const { skipBridges } = useSkipBridge({
    chainConfig,
    cosmosAddress: address,
  })

  const columns = useAccountBalancesColumns(account, showLiquidationPrice, abbreviated)

  const accountBalanceData = useAccountBalanceData({
    account,
    updatedAccount,
    lendingData,
    borrowingData,
  })
  const accountTitle = useAccountTitle(account, true)

  const { dynamicAssets, currentBridges, forceUpdate } = useSkipBridgeData({
    accountBalanceData,
    chainConfig,
  })

  useEffect(() => {
    const skipBridgesString = localStorage.getItem(`${chainConfig.id}/skipBridges`)
    if (skipBridgesString) {
      forceUpdate({})
    }
  }, [skipBridges, forceUpdate, chainConfig.id])

  if (accountBalanceData.length === 0 && currentBridges.length === 0) {
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
          {isUsersAccount && !isHls ? (
            <ActionButton
              className='w-full'
              text='Fund this Account'
              color='tertiary'
              onClick={() => {
                if (currentAccount?.id !== account.id) {
                  navigate(
                    getRoute(getPage(pathname, chainConfig), searchParams, address, account.id),
                  )
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
          ) : (
            <Text size='sm' className='text-center'>
              This account has no balances.
            </Text>
          )}
        </div>
      </ConditionalWrapper>
    )
  }

  return (
    <Table
      title={
        <Text
          size='lg'
          className='flex items-center justify-between w-full p-4 font-semibold bg-white/10'
        >
          <span>Balances</span>
          <span className='text-white/60'>{accountTitle}</span>
        </Text>
      }
      columns={columns}
      data={dynamicAssets}
      tableBodyClassName={classNames(tableBodyClassName, 'text-white/60')}
      initialSorting={[{ id: VALUE_META.accessorKey, desc: true }]}
      spacingClassName='p-2'
      hideCard={hideCard}
      type='balances'
      isBalancesTable
    />
  )
}
