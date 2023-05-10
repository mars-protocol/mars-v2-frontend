import { flexRender, Row } from '@tanstack/react-table'
import classNames from 'classnames'

type AssetRowProps = {
  row: Row<AccountBalanceRow>
}

export const AssetRow = (props: AssetRowProps) => {
  return (
    <tr key={props.row.id} className=' text-white/60'>
      {props.row.getVisibleCells().map((cell) => {
        return (
          <td
            key={cell.id}
            className={classNames(cell.column.id !== 'symbol' && 'pl-4 text-right', 'p-2')}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
