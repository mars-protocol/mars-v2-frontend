import { ColumnDef, Row, Table } from '@tanstack/react-table'
import { useMemo } from 'react'

import AssetImage from 'components/AssetImage'
import LendingActionButtons from 'components/Earn/Lend/LendingActionButtons'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown, ChevronUp } from 'components/Icons'
import AssetListTable from 'components/MarketAssetTable'
import MarketAssetTableRow from 'components/MarketAssetTable/MarketAssetTableRow'
import MarketDetails from 'components/MarketAssetTable/MarketDetails'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import { convertLiquidityRateToAPR, demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  title: string
  data: LendingMarketTableData[]
}

export default function LendingMarketsTable(props: Props) {
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
        expandedDetails={<MarketDetails data={row.original} />}
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
              <AssetImage asset={asset} size={32} />
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
                    animate
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
          return (
            <FormattedNumber
              amount={BN(convertLiquidityRateToAPR(row.original.marketLiquidityRate))}
              options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
              className='text-xs'
              animate
            />
          )
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

          return (
            <TitleAndSubCell
              className='text-xs'
              title={
                <FormattedNumber
                  amount={marketDepositCap}
                  options={{ abbreviated: true, decimals: asset.decimals }}
                  animate
                />
              }
              sub={
                <FormattedNumber
                  amount={remainingCap}
                  options={{ abbreviated: true, decimals: asset.decimals, suffix: ` left` }}
                  animate
                />
              }
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
            <div className='w-4'>{row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}</div>
          </div>
        ),
      },
    ],
    [displayCurrencySymbol, shouldShowAccountDeposit],
  )

  return <AssetListTable title={title} rowRenderer={rowRenderer} columns={columns} data={data} />
}
