import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import ActionButton from 'components/Button/ActionButton'
import DisplayCurrency from 'components/DisplayCurrency'
import VaultExpanded from 'components/Earn/Farm/VaultExpanded'
import VaultLogo from 'components/Earn/Farm/VaultLogo'
import { VaultRow } from 'components/Earn/Farm/VaultRow'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown, SortAsc, SortDesc, SortNone } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { ORACLE_DENOM } from 'constants/oracle'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums/vault'
import { getAssetByDenom } from 'utils/assets'
import { formatPercent, produceCountdown } from 'utils/formatters'

type Props = {
  data: Vault[] | DepositedVault[]
  isLoading?: boolean
}

export const VaultTable = (props: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'name', desc: true }])

  const columns = React.useMemo<ColumnDef<Vault | DepositedVault>[]>(() => {
    return [
      {
        header: 'Vault',
        accessorKey: 'name',
        cell: ({ row }) => {
          const vault = row.original as DepositedVault
          const timeframe = vault.lockup.timeframe[0]
          const unlockDuration = !!timeframe ? ` - (${vault.lockup.duration}${timeframe})` : ''

          const status = vault.status
          let remainingTime = 0

          if (status === VaultStatus.UNLOCKING && vault.unlocksAt) {
            remainingTime = vault.unlocksAt - Date.now()
          }

          return (
            <div className='flex'>
              <VaultLogo vault={vault} />
              <TitleAndSubCell
                className='ml-2 mr-2 text-left'
                title={`${vault.name}${unlockDuration}`}
                sub={vault.provider}
              />
              {status === VaultStatus.UNLOCKING && (
                <Text
                  className='group/label relative h-5 w-[84px] rounded-sm bg-green text-center leading-5 text-white'
                  size='xs'
                >
                  <span
                    className={classNames(
                      'absolute inset-0 text-center',
                      'opacity-100 transition-opacity duration-500',
                      'group-hover/label:opacity-0 group-[.is-expanded]/row:opacity-0',
                    )}
                  >
                    Unlocking
                  </span>
                  <span
                    className={classNames(
                      'absolute inset-0 text-center',
                      'opacity-0 transition-opacity duration-500',
                      'group-hover/label:opacity-100 group-[.is-expanded]/row:opacity-100',
                    )}
                  >
                    {produceCountdown(remainingTime)}
                  </span>
                </Text>
              )}
              {status === VaultStatus.UNLOCKED && (
                <Text
                  className='h-5 w-[84px] rounded-sm bg-green text-center leading-5 text-white'
                  size='xs'
                >
                  Unlocked
                </Text>
              )}
            </div>
          )
        },
      },

      ...((props.data[0] as DepositedVault)?.values
        ? [
            {
              header: 'Pos. Value',
              cell: ({ row }: { row: Row<DepositedVault | Vault> }) => {
                const vault = row.original as DepositedVault
                const positionValue = vault.values.primary.plus(vault.values.secondary)
                const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue)
                return <DisplayCurrency coin={coin} className='text-xs' />
              },
            },
          ]
        : []),
      {
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => {
          const vault = row.original as DepositedVault
          if (vault.apy === null) return <Loading />
          return (
            <FormattedNumber
              amount={(vault.apy ?? 0) * 100}
              options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
              className='text-xs'
              animate
            />
          )
        },
      },
      {
        accessorKey: 'tvl',
        header: 'TVL',
        cell: ({ row }) => {
          const vault = row.original as DepositedVault
          if (props.isLoading) return <Loading />
          const coin = new BNCoin({
            denom: vault.cap.denom,
            amount: vault.cap.used.toString(),
          })

          return <DisplayCurrency coin={coin} className='text-xs' />
        },
      },
      {
        accessorKey: 'cap',
        header: 'Depo. Cap',
        cell: ({ row }) => {
          const vault = row.original as DepositedVault
          if (props.isLoading) return <Loading />
          const percent = vault.cap.used
            .dividedBy(vault.cap.max.multipliedBy(VAULT_DEPOSIT_BUFFER))
            .multipliedBy(100)
            .integerValue()

          const decimals = getAssetByDenom(vault.cap.denom)?.decimals ?? 6

          return (
            <TitleAndSubCell
              title={
                <FormattedNumber
                  amount={vault.cap.max.toNumber()}
                  options={{ minDecimals: 2, abbreviated: true, decimals }}
                  className='text-xs'
                  animate
                />
              }
              sub={
                <FormattedNumber
                  amount={percent.toNumber()}
                  options={{ minDecimals: 2, maxDecimals: 2, suffix: '% Filled' }}
                  className='text-xs'
                  animate
                />
              }
            />
          )
        },
      },
      {
        accessorKey: 'ltv.max',
        header: 'Max LTV',
        cell: ({ row }) => {
          if (props.isLoading) return <Loading />
          return <Text className='text-xs'>{formatPercent(row.original.ltv.max)}</Text>
        },
      },
      {
        accessorKey: 'ltv.liq',
        header: 'Liq. LTV',
        cell: ({ row }) => {
          if (props.isLoading) return <Loading />
          return <Text className='text-xs'>{formatPercent(row.original.ltv.liq)}</Text>
        },
      },
      {
        accessorKey: 'details',
        enableSorting: false,
        header: (data) => {
          const tableData = data.table.options.data as DepositedVault[]
          if (tableData.length && tableData[0].status) return 'Details'
          return 'Deposit'
        },
        cell: ({ row }) => {
          const vault = row.original as DepositedVault

          function enterVaultHandler() {
            useStore.setState({
              vaultModal: {
                vault,
                selectedBorrowDenoms: [vault.denoms.secondary],
                isCreate: true,
              },
            })
          }

          if (props.isLoading) return <Loading />
          return (
            <div className='flex items-center justify-end'>
              {vault.status ? (
                <div className={classNames('w-4', row.getIsExpanded() && 'rotate-180')}>
                  <ChevronDown />
                </div>
              ) : (
                <ActionButton onClick={enterVaultHandler} color='tertiary' text='Deposit' />
              )}
            </div>
          )
        },
      },
    ]
  }, [props.data, props.isLoading])

  const table = useReactTable({
    data: props.data,
    columns: columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <table className='w-full'>
      <thead className='bg-black/20'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'px-4 py-3',
                    header.column.getCanSort() && 'cursor-pointer',
                    header.id === 'symbol' ? 'text-left' : 'text-right',
                  )}
                >
                  <div
                    className={classNames(
                      'flex',
                      header.id === 'name' ? 'justify-start' : 'justify-end',
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
                      size='xs'
                      className='flex items-center font-normal text-white/40'
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
      <tbody>
        {table.getRowModel().rows.map((row) => {
          if (row.getIsExpanded()) {
            return (
              <React.Fragment key={`${row.id}_subrow`}>
                <VaultRow row={row} resetExpanded={table.resetExpanded} />
                <VaultExpanded row={row} resetExpanded={table.resetExpanded} />
              </React.Fragment>
            )
          }
          return (
            <VaultRow key={row.original.address} row={row} resetExpanded={table.resetExpanded} />
          )
        })}
      </tbody>
    </table>
  )
}
