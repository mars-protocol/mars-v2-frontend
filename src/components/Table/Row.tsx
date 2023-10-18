import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'

interface Props<T> {
  row: TanstackRow<T>
  table: TanstackTable<T>
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => JSX.Element
  rowClassName?: string
  rowClickHandler?: () => void
}

export default function Row<T>(props: Props<T>) {
  return (
    <>
      <tr
        key={props.row.id}
        className={classNames(
          'group/row transition-bg',
          props.renderExpanded && 'hover:cursor-pointer',
          props.row.getIsExpanded() ? 'is-expanded bg-black/20' : 'hover:bg-white/5',
        )}
        onClick={(e) => {
          e.preventDefault()
          const isExpanded = props.row.getIsExpanded()
          props.table.resetExpanded()
          !isExpanded && props.row.toggleExpanded()
        }}
      >
        {props.row.getVisibleCells().map((cell) => {
          return (
            <td key={cell.id} className={'p-4 text-right'}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          )
        })}
      </tr>
      {props.row.getIsExpanded() &&
        props.renderExpanded &&
        props.renderExpanded(props.row, props.table)}
    </>
  )
}
