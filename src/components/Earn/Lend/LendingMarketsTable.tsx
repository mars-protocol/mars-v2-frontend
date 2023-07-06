import { ColumnDef, Row, Table } from '@tanstack/react-table'
import Image from 'next/image'
import { useMemo } from 'react'

import LendingActionButtons from 'components/Earn/Lend/LendingActionButtons'
import LendingDetails from 'components/Earn/Lend/LendingDetails'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown, ChevronUp } from 'components/Icons'
import AssetListTable from 'components/MarketAssetTable'
import MarketAssetTableRow from 'components/MarketAssetTable/MarketAssetTableRow'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import { convertLiquidityRateToAPR, demagnify, formatValue } from 'utils/formatters'

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
            <div className='flex items-center flex-1 gap-3'>
              <Image src={asset.logo} alt={asset.symbol} width={32} height={32} />
              <TitleAndSubCell
                title={asset.symbol}
                sub={asset.name}
                className='text-left min-w-15'
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
            <div className='w-4'>{row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}</div>
          </div>
        ),
      },
    ],
    [displayCurrencySymbol, shouldShowAccountDeposit],
  )

  return <AssetListTable title={title} rowRenderer={rowRenderer} columns={columns} data={data} />
}

export default LendingMarketsTable
