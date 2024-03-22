import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'

interface Props<T> {
  row: TanstackRow<T>
  table: TanstackTable<T>
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => JSX.Element
  rowClassName?: string
  spacingClassName?: string
  className?: string
  isSelectable?: boolean
  type?: TableType
  onClick?: (id: string) => void
}

function getBorderColor(
  type: TableType,
  row: AccountBalanceRow | AccountStrategyRow | AccountPerpRow,
) {
  if (type === 'strategies') return ''
  if (type === 'balances') {
    const balancesRow = row as AccountBalanceRow
    return balancesRow.type === 'borrow' ? 'border-loss' : 'border-profit'
  }

  const perpRow = row as AccountPerpRow
  return perpRow.tradeDirection === 'short' ? 'border-loss' : 'border-profit'
}

export default function Row<T>(props: Props<T>) {
  const { renderExpanded, table, row, type, spacingClassName, isSelectable } = props
  const canExpand = !!renderExpanded

  return (
    <>
      <tr
        key={`${row.id}-row`}
        className={classNames(
          'group/row transition-bg',
          (renderExpanded || isSelectable || props.onClick) && 'hover:cursor-pointer',
          canExpand && row.getIsExpanded() ? 'is-expanded bg-black/20' : 'hover:bg-white/5',
        )}
        onClick={(e) => {
          e.preventDefault()
          if (isSelectable) {
            row.toggleSelected()
          }
          if (canExpand) {
            const isExpanded = row.getIsExpanded()
            table.resetExpanded()
            !isExpanded && row.toggleExpanded()
          }

          if (props.onClick) {
            props.onClick((row.original as any).asset.denom)
          }
        }}
      >
        {row.getVisibleCells().map((cell) => {
          const isSymbolOrName = cell.column.id === 'symbol' || cell.column.id === 'name'
          const canSort = table.getColumn(cell.column.id)?.getCanSort()
          return (
            <td
              key={cell.id}
              className={classNames(
                isSymbolOrName ? 'text-left' : 'text-right',
                spacingClassName ?? 'px-3 py-4',
                canSort && !type && 'pr-8',
                type && type !== 'strategies' && isSymbolOrName && 'border-l',
                type && type !== 'strategies' && getBorderColor(type, cell.row.original as any),
                cell.column.columnDef.meta?.className,
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          )
        })}
      </tr>
      {row.getIsExpanded() && renderExpanded && renderExpanded(row, table)}
    </>
  )
}
