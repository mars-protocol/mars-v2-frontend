import classNames from 'classnames'

import { SortNone } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'

interface Props {
  labels: string[]
  rowCount: number
}

export default function TableSkeleton(props: Props) {
  return (
    <table className='w-full'>
      <thead className='border-b border-white/10'>
        <tr>
          {props.labels.map((label, index) => {
            return (
              <th
                key={label}
                className={classNames('p-3', index === props.labels.length - 1 && 'pr-4')}
              >
                <div
                  className={classNames(
                    'flex',
                    index === 0 ? 'justify-start' : 'justify-end',
                    'align-center',
                  )}
                >
                  <span className='w-6 h-6 text-white opacity-20'>
                    <SortNone />
                  </span>
                  <Text
                    tag='span'
                    size='sm'
                    className={classNames(
                      'flex  font-normal text-white/70 items-center',
                      index !== 0 && 'justify-end',
                    )}
                  >
                    {label}
                  </Text>
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {Array(props.rowCount)
          .fill(null)
          .map((_, index) => {
            return (
              <tr key={index} className='pl-2'>
                {props.labels.map((_, index2) => {
                  return (
                    <td
                      key={`${index}-${index2}`}
                      className={classNames(
                        index !== 0 && 'justify-end',
                        index2 === 0 && 'pl-4',
                        index2 === props.labels.length - 1 && 'pr-4',
                        'p-2 text-right',
                      )}
                    >
                      <Loading className={classNames('w-20 h-3', index2 !== 0 && 'ml-auto')} />
                    </td>
                  )
                })}
              </tr>
            )
          })}
      </tbody>
    </table>
  )
}
