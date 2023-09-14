import { ColumnDef, Row, Table } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'

import AmountAndValue from 'components/AmountAndValue'
import AssetImage from 'components/AssetImage'
import LendingActionButtons from 'components/Earn/Lend/LendingActionButtons'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown, ChevronUp } from 'components/Icons'
import AssetListTable from 'components/MarketAssetTable'
import MarketAssetTableRow from 'components/MarketAssetTable/MarketAssetTableRow'
import MarketDetails from 'components/MarketAssetTable/MarketDetails'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { convertLiquidityRateToAPR } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  title: string
  data: LendingMarketTableData[]
}

export default function LendingMarketsTable(props: Props) {
  const { title, data } = props
  const shouldShowAccountDeposit = !!data[0]?.accountLentValue

  const rowRenderer = useCallback(
    (row: Row<LendingMarketTableData>, table: Table<LendingMarketTableData>) => {
      return (
        <MarketAssetTableRow
          key={`lend-asset-${row.id}`}
          isExpanded={row.getIsExpanded()}
          resetExpanded={table.resetExpanded}
          rowData={row}
          expandedActionButtons={<LendingActionButtons data={row.original} />}
          expandedDetails={<MarketDetails data={row.original} type='lend' />}
        />
      )
    },
    [],
  )

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
              <AssetImage asset={asset} size={32} />
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
                const amount = row.original.accountLentAmount

                return (
                  <AmountAndValue
                    asset={row.original.asset}
                    amount={amount ? BN(amount) : BN_ZERO}
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
          if (!row.original.borrowEnabled) {
            return <Text>-</Text>
          }

          return (
            <FormattedNumber
              amount={convertLiquidityRateToAPR(row.original.marketLiquidityRate)}
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
          const remainingCap = row.original.marketDepositCap.minus(marketDepositAmount)

          return (
            <TitleAndSubCell
              className='text-xs'
              title={
                <FormattedNumber
                  amount={marketDepositCap.toNumber()}
                  options={{ abbreviated: true, decimals: asset.decimals }}
                  animate
                />
              }
              sub={
                <FormattedNumber
                  amount={remainingCap.toNumber()}
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
    [shouldShowAccountDeposit],
  )

  return <AssetListTable title={title} rowRenderer={rowRenderer} columns={columns} data={data} />
}
