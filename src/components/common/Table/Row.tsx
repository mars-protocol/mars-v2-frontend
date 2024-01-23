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
  isBalancesTable?: boolean
  isPerpsTable?: boolean
}

function getBalanceBorderColor(row: AccountBalanceRow) {
  return row.type === 'borrowing' ? 'border-loss' : 'border-profit'
}
function getPerpBorderColor(row: AccountPerpRow) {
  return row.tradeDirection === 'short' ? 'border-loss' : 'border-profit'
}

export default function Row<T>(props: Props<T>) {
  const {
    renderExpanded,
    table,
    row,
    isBalancesTable,
    isPerpsTable,
    spacingClassName,
    isSelectable,
  } = props
  const canExpand = !!renderExpanded

  return (
    <>
      <tr
        key={`${row.id}-row`}
        className={classNames(
          'group/row transition-bg',
          (renderExpanded || isSelectable) && 'hover:cursor-pointer',
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
        }}
      >
        {row.getVisibleCells().map((cell) => {
          const isSymbolOrName = cell.column.id === 'symbol' || cell.column.id === 'name'
          return (
            <td
              key={cell.id}
              className={classNames(
                isSymbolOrName ? 'text-left' : 'text-right',
                spacingClassName ?? 'px-3 py-4',
                (isBalancesTable || isPerpsTable) && isSymbolOrName && 'border-l',
                isBalancesTable && getBalanceBorderColor(cell.row.original as AccountBalanceRow),
                isPerpsTable && getPerpBorderColor(cell.row.original as AccountPerpRow),
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
