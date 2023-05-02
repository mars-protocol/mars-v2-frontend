import { flexRender, Row } from '@tanstack/react-table'
import classNames from 'classnames'

type AssetRowProps = {
  row: Row<Vault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export const VaultRow = (props: AssetRowProps) => {
  return (
    <tr
      key={props.row.id}
      className={classNames(
        'bg-white/3 cursor-pointer border-b border-t border-white/5 transition-colors hover:bg-white/5',
      )}
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      {props.row.getVisibleCells().map((cell, index) => {
        return (
          <td key={cell.id} className={'p-4 text-right'}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
