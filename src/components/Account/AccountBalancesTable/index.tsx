import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getAmountChangeColor } from 'components/Account/AccountBalancesTable/functions'
import useAccountBalanceData from 'components/Account/AccountBalancesTable/useAccountBalanceData'
import AccountFund from 'components/Account/AccountFund'
import ActionButton from 'components/Button/ActionButton'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'

interface Props {
  account: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
  tableBodyClassName?: string
}

export default function Index(props: Props) {
  const { account, lendingData, borrowingData, tableBodyClassName } = props
  const currentAccount = useCurrentAccount()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const [sorting, setSorting] = useState<SortingState>([])
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountBalanceData = useAccountBalanceData({
    account,
    updatedAccount,
    lendingData,
    borrowingData,
  })

  const columns = useMemo<ColumnDef<AccountBalanceRow>[]>(
    () => [
      {
        header: 'Asset',
        accessorKey: 'symbol',
        id: 'symbol',
        cell: ({ row }) => {
          return (
            <Text size='xs'>
              {row.original.symbol}
              {row.original.type === 'lending' && <span className='ml-1 text-profit'>(lent)</span>}
              {row.original.type === 'vault' && <span className='ml-1 text-profit'>(farm)</span>}
            </Text>
          )
        },
      },
      {
        header: 'Value',
        accessorKey: 'value',
        id: 'value',
        cell: ({ row }) => {
          const color = getAmountChangeColor(row.original.type, row.original.amountChange)
          const coin = new BNCoin({
            denom: ORACLE_DENOM,
            amount: row.original.value.toString(),
          })
          return <DisplayCurrency coin={coin} className={classNames('text-xs text-right', color)} />
        },
      },
      {
        id: 'size',
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => {
          if (row.original.amount.isEqualTo(BN_ZERO))
            return <span className='w-full text-xs text-center'>&ndash;</span>
          const color = getAmountChangeColor(row.original.type, row.original.amountChange)
          const amount = demagnify(
            row.original.amount,
            getAssetByDenom(row.original.denom) ?? ASSETS[0],
          )
          return (
            <FormattedNumber
              className={classNames('text-xs text-right', color)}
              amount={Number(BN(amount).abs())}
              options={{ maxDecimals: 4, abbreviated: true }}
              animate
            />
          )
        },
      },
      {
        id: 'apy',
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => {
          if (row.original.type === 'deposits')
            return <span className='w-full text-xs text-center'>&ndash;</span>
          return (
            <FormattedNumber
              className='text-xs'
              amount={row.original.apy}
              options={{ maxDecimals: 2, minDecimals: 2, suffix: '%' }}
              animate
            />
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: accountBalanceData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (accountBalanceData.length === 0)
    return (
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
                component: <AccountFund />,
                onClose: () => {
                  useStore.setState({ getStartedModal: true })
                },
              },
            })
          }}
        />
      </div>
    )

  return (
    <table className='w-full'>
      <thead className='border-b border-white/5'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'p-2',
                    header.column.getCanSort() && 'cursor-pointer',
                    header.id === 'symbol' ? 'text-left' : 'text-right',
                  )}
                >
                  <div
                    className={classNames(
                      'flex',
                      header.id === 'symbol' ? 'justify-start' : 'justify-end',
                      'align-center',
                    )}
                  >
                    <span className='w-6 h-6 text-white'>
                      {header.column.getCanSort()
                        ? {
                            asc: <SortAsc />,
                            desc: <SortDesc />,
                            false: <SortNone />,
                          }[header.column.getIsSorted() as string] ?? null
                        : null}
                    </span>
                    <Text
                      tag='span'
                      size='sm'
                      className='flex items-center font-normal text-white/70'
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Text>
                  </div>
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody className={tableBodyClassName}>
        {table.getRowModel().rows.map((row) => {
          return (
            <tr key={row.id} className=' text-white/60'>
              {row.getVisibleCells().map((cell) => {
                const borderClass =
                  cell.row.original.type === 'borrowing' ? 'border-loss' : 'border-profit'
                return (
                  <td
                    key={cell.id}
                    className={classNames(
                      cell.column.id === 'symbol' ? `border-l ${borderClass}` : 'text-right',
                      'p-2',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}