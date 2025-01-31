import classNames from 'classnames'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import useAccountBalancesColumns from 'components/account/AccountBalancesTable/Columns/useAccountBalancesColumns'
import useAccountBalanceData from 'components/account/AccountBalancesTable/useAccountBalanceData'
import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import ActionButton from 'components/common/Button/ActionButton'
import Card from 'components/common/Card'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useStore from 'store'
import { ColumnDef } from '@tanstack/table-core'
import { getPage, getRoute } from 'utils/route'
import { BN } from 'utils/helpers'
import { demagnify } from 'utils/formatters'
import useChainConfig from 'hooks/chain/useChainConfig'
import { SkipBridgeTransaction, useSkipBridge } from 'hooks/bridge/useSkipBridge'

interface Props {
  account: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
  hideCard?: boolean
  tableBodyClassName?: string
  showLiquidationPrice?: boolean
  isUsersAccount?: boolean
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
  } = props
  const chainConfig = useChainConfig()
  const currentAccount = useCurrentAccount()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const isHls = account.kind === 'high_levered_strategy'
  const whitelistedAssets = useWhitelistedAssets()
  const accountBalanceData = useAccountBalanceData({
    account,
    updatedAccount,
    lendingData,
    borrowingData,
  })

  const enhancedAccountBalanceData = useMemo(() => {
    return accountBalanceData.map((row) => ({
      ...row,
      isWhitelisted: whitelistedAssets.some((asset) => asset.denom === row.denom),
    }))
  }, [accountBalanceData, whitelistedAssets])

  const sortedAccountBalanceData = enhancedAccountBalanceData.sort((a, b) => {
    if (a.isWhitelisted && !b.isWhitelisted) return -1
    if (!a.isWhitelisted && b.isWhitelisted) return 1
    return 0
  })

  const columns = useAccountBalancesColumns(account, showLiquidationPrice)
  const { skipBridges } = useSkipBridge({
    chainConfig,
    cosmosAddress: address,
    evmAddress: undefined,
  })

  const dynamicColumns: ColumnDef<AccountBalanceRow>[] = useMemo(() => {
    return columns
  }, [columns])

  const [, forceUpdate] = useState({})
  useEffect(() => {
    const skipBridgesString = localStorage.getItem('skipBridges')
    if (skipBridgesString) {
      forceUpdate({})
    }
  }, [skipBridges])
  const dynamicAssets = useMemo(() => {
    let assets = accountBalanceData.map(
      (asset): AccountBalanceRow => ({
        ...asset,
        bridgeStatus: undefined,
        skipBridgeId: undefined,
      }),
    )

    const skipBridgesString = localStorage.getItem('skipBridges')
    const currentBridges = skipBridgesString ? JSON.parse(skipBridgesString) : []

    if (currentBridges.length > 0) {
      const bridgedAssets = currentBridges.map(
        (bridge: SkipBridgeTransaction): AccountBalanceRow => ({
          skipBridgeId: bridge.id,
          bridgeStatus: bridge.status,
          type: 'bridge',
          symbol: 'USDC',
          size: demagnify(bridge.amount || 0, { decimals: 6, symbol: 'USDC' }),
          value: demagnify(bridge.amount || 0, { decimals: 6, symbol: 'USDC' }).toString(),
          denom: chainConfig.stables[0],
          amount: BN(bridge.amount || 0),
          apy: 0,
          amountChange: BN('0'),
          campaigns: [],
        }),
      )
      assets = [...bridgedAssets, ...assets]
    }

    return assets
  }, [accountBalanceData, chainConfig.stables])

  const skipBridgesString = localStorage.getItem('skipBridges')
  const currentBridges = skipBridgesString ? JSON.parse(skipBridgesString) : []

  if (sortedAccountBalanceData.length === 0 && currentBridges.length === 0) {
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
                      // TODO: update docs to reflect the current state of v2
                      //useStore.setState({ getStartedModal: true })
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
          <span className='text-white/60'>Credit Account {account.id}</span>
        </Text>
      }
      columns={dynamicColumns}
      data={dynamicAssets}
      tableBodyClassName={classNames(tableBodyClassName, 'text-white/60')}
      initialSorting={[]}
      spacingClassName='p-2'
      hideCard={hideCard}
      type='balances'
      isBalancesTable
    />
  )
}
