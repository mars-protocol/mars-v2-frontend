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

import AccountFund from 'components/Account/AccountFund'
import Button from 'components/Button'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/useCurrentAccount'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import { convertLiquidityRateToAPR, demagnify, getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'

import { ORACLE_DENOM } from '../../constants/oracle'

interface Props {
  account: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
  tableBodyClassName?: string
}

interface PositionValue {
  type: 'deposits' | 'borrowing' | 'lending'
  symbol: string
  size: number
  value: string
  denom: string
  amount: BigNumber
  apy: number
}

function calculatePositionValues(
  type: 'deposits' | 'borrowing' | 'lending',
  asset: Asset,
  prices: BNCoin[],
  position: BNCoin,
  apy: number,
  prev: BNCoin,
) {
  const { amount, denom } = position
  const hasChanged = !prev.amount.isEqualTo(amount)
  const isIncrease = hasChanged && amount.isGreaterThan(prev.amount)
  const isBorrowing = type === 'borrowing'

  let change = hasChanged && 'profit'
  if (hasChanged && ((isIncrease && isBorrowing) || (!isIncrease && !isBorrowing))) change = 'loss'

  return {
    type,
    symbol: asset.symbol,
    size: demagnify(amount, asset),
    value: getCoinValue(BNCoin.fromDenomAndBigNumber(denom, amount), prices).toString(),
    denom,
    amount: type === 'borrowing' ? amount.negated() : amount,
    apy,
    change,
  }
}

function calculateVaultValues(vault: DepositedVault, apy: number, prev: DepositedVault) {
  const { name } = vault
  const totalValue = vault.values.primary.plus(vault.values.secondary)
  const prevTotalValue = prev.values.primary.plus(prev.values.secondary)
  const hasChanged = !totalValue.isEqualTo(prevTotalValue)

  let change = hasChanged && 'profit'
  if (hasChanged && totalValue.isLessThan(prevTotalValue)) change = 'loss'

  return {
    type: 'vault',
    symbol: name,
    size: 0,
    value: totalValue.toString(),
    denom: vault.denoms.lp,
    amount: BN_ZERO,
    apy,
    change,
  }
}

export default function AccountBalancesTable(props: Props) {
  const { account, lendingData, borrowingData, tableBodyClassName } = props
  const { data: prices } = usePrices()
  const currentAccount = useCurrentAccount()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const [sorting, setSorting] = useState<SortingState>([])
  const updatedAccount = useStore((s) => s.updatedAccount)

  const balanceData = useMemo<AccountBalanceRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountDeposits = usedAccount?.deposits ?? []
    const accountLends = usedAccount?.lends ?? []
    const accountDebts = usedAccount?.debts ?? []
    const accountVaults = usedAccount?.vaults ?? []

    const deposits: PositionValue[] = []
    accountDeposits.forEach((deposit) => {
      const asset = ASSETS.find(byDenom(deposit.denom))
      if (!asset) return
      const apy = 0
      const prevDeposit = updatedAccount
        ? account?.deposits.find((position) => position.denom === deposit.denom) ?? deposit
        : deposit
      deposits.push(calculatePositionValues('deposits', asset, prices, deposit, apy, prevDeposit))
    })

    const lends = accountLends.map((lending) => {
      const asset = ASSETS.find(byDenom(lending.denom)) ?? ASSETS[0]
      const apr = convertLiquidityRateToAPR(
        lendingData.find((market) => market.asset.denom === lending.denom)?.marketLiquidityRate ??
          0,
      )
      const apy = convertAprToApy(apr, 365)
      const prevLending = updatedAccount
        ? account?.lends.find((position) => position.denom === lending.denom) ?? lending
        : lending
      return calculatePositionValues('lending', asset, prices, lending, apy, prevLending)
    })

    const vaults = accountVaults.map((vault) => {
      const apy = (vault.apy ?? 0) * 100
      const prevVault = updatedAccount
        ? account?.vaults.find((position) => position.name === vault.name) ?? vault
        : vault
      return calculateVaultValues(vault, apy, prevVault)
    })

    const debts = accountDebts.map((debt) => {
      const asset = ASSETS.find(byDenom(debt.denom)) ?? ASSETS[0]
      const apy = borrowingData.find((market) => market.asset.denom === debt.denom)?.borrowRate ?? 0
      const prevDebt = updatedAccount
        ? account?.debts.find((position) => position.denom === debt.denom) ?? debt
        : debt
      return calculatePositionValues('borrowing', asset, prices, debt, apy * -100, prevDebt)
    })
    return [...deposits, ...lends, ...vaults, ...debts]
  }, [prices, account, updatedAccount, borrowingData, lendingData])

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
          const change = row.original.change
          const coin = new BNCoin({
            denom: ORACLE_DENOM,
            amount: row.original.value.toString(),
          })
          return (
            <DisplayCurrency
              coin={coin}
              className={classNames('text-xs text-right', change && `text-${change}`)}
            />
          )
        },
      },
      {
        id: 'size',
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => {
          if (row.original.amount.isEqualTo(BN_ZERO))
            return <span className='w-full text-xs text-center'>&ndash;</span>
          const change = row.original.change
          const amount = demagnify(
            row.original.amount,
            getAssetByDenom(row.original.denom) ?? ASSETS[0],
          )
          return (
            <FormattedNumber
              className={classNames('text-xs text-right', change && `text-${change}`)}
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
          if (row.original.type === 'deposit')
            return <span className='w-full text-xs text-center'>&ndash;</span>
          return (
            <FormattedNumber
              className={'text-xs'}
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
    data: balanceData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (balanceData.length === 0)
    return (
      <div className='w-full p-4'>
        <Button
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
