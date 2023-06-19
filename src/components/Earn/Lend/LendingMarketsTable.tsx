import { ColumnDef, Row, Table } from '@tanstack/react-table'
import { useMemo } from 'react'
import Image from 'next/image'
import classNames from 'classnames'

import Text from 'components/Text'
import AssetListTable from 'components/MarketAssetTable'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { ChevronDown, ChevronRight } from 'components/Icons'
import { convertLiquidityRateToAPR, demagnify, formatValue } from 'utils/formatters'
import MarketAssetTableRow from 'components/MarketAssetTable/MarketAssetTableRow'
import LendingActionButtons from 'components/Earn/Lend/LendingActionButtons'
import LendingDetails from 'components/Earn/Lend/LendingDetails'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import { FormattedNumber } from 'components/FormattedNumber'

interface Props {
  title: string
  data: LendingMarketTableData[]
}

function LendingMarketsTable(props: Props) {
  const { title, data } = props
  const { symbol: displayCurrencySymbol } = useDisplayCurrencyPrice()
  const shouldShowAccountDeposit = !!data[0]?.accountLentValue

  const rowRenderer = (row: Row<LendingMarketTableData>, table: Table<LendingMarketTableData>) => {
    return (
      <MarketAssetTableRow
        key={`lend-asset-${row.id}`}
        isExpanded={row.getIsExpanded()}
        resetExpanded={table.resetExpanded}
        rowData={row}
        expandedActionButtons={<LendingActionButtons data={row.original} />}
        expandedDetails={<LendingDetails data={row.original} />}
      />
    )
  }

  const columns = useMemo<ColumnDef<LendingMarketTableData>[]>(
    () => [
      {
        accessorKey: 'asset.name',
        header: 'Asset',
        id: 'symbol',
        cell: ({ row }) => {
          const asset = row.original.asset

          return (
            <div className='flex flex-1 items-center gap-3'>
              <Image src={asset.logo} alt={asset.symbol} width={32} height={32} />
              <TitleAndSubCell
                title={asset.symbol}
                sub={asset.name}
                className='min-w-15 text-left'
              />
            </div>
          )
        },
      },
      ...(shouldShowAccountDeposit
        ? [
            {
              accessorKey: 'accountDepositValue',
              header: 'Deposited',
              cell: ({ row }) => {
                const accountDepositValue = row.original.accountLentValue as BigNumber

                return (
                  <FormattedNumber
                    className='text-xs'
                    animate={true}
                    amount={accountDepositValue}
                    options={{ suffix: ` ${displayCurrencySymbol}` }}
                  />
                )
              },
            } as ColumnDef<LendingMarketTableData>,
          ]
        : []),
      {
        accessorKey: 'marketLiquidityRate',
        header: 'APR',
        cell: ({ row }) => {
          const apr = convertLiquidityRateToAPR(row.original.marketLiquidityRate)
          return <Text size='xs'>{apr.toFixed(2)}%</Text>
        },
      },
      {
        accessorKey: 'marketDepositCap',
        header: 'Depo. Cap',
        cell: ({ row }) => {
          const { marketDepositCap, marketDepositAmount, asset } = row.original
          const remainingCap = row.original.marketDepositCap.minus(
            demagnify(marketDepositAmount, asset),
          )

          const [formattedRemainingCap, formattedDepositCap] = [remainingCap, marketDepositCap].map(
            (value) =>
              formatValue(value.toNumber(), {
                decimals: asset.decimals,
                abbreviated: true,
              }),
          )

          return (
            <TitleAndSubCell
              className='text-xs'
              title={formattedDepositCap}
              sub={`${formattedRemainingCap} left`}
            />
          )
        },
      },
      {
        accessorKey: 'manage',
        enableSorting: false,
        header: 'Manage',
        cell: ({ row }) => (
          <div className='flex items-center justify-end'>
            <div className={classNames('w-4')}>
              {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
            </div>
          </div>
        ),
      },
    ],
    [displayCurrencySymbol, shouldShowAccountDeposit],
  )

  return <AssetListTable title={title} rowRenderer={rowRenderer} columns={columns} data={data} />
}

export default LendingMarketsTable
