import classNames from 'classnames'

import { FormattedNumber, Text } from 'components'

export const PositionsList = ({ title, data }: PositionsListProps) => {
  if (data.length === 0) return null

  const arrayKeys = Object.keys(data[0])

  return (
    <div className='flex w-full flex-wrap'>
      <Text uppercase className='w-full bg-black/20 px-4 py-2 text-white/40'>
        {title}
      </Text>
      <div className='flex w-full flex-wrap'>
        <>
          <div className='mb-2 flex w-full border-b border-white/20 bg-black/20 px-4 py-2'>
            {arrayKeys.map((label, index) => (
              <Text key={index} size='xs' uppercase className='flex-1 text-white'>
                {label}
              </Text>
            ))}
          </div>
          {data &&
            data.map((positionsData: PositionsData, index) => (
              <div key={index} className='align-center flex w-full px-4 py-2'>
                {arrayKeys.map((key, index) => {
                  if (index === 0)
                    return (
                      <Text
                        size='xs'
                        key={index}
                        className={classNames(
                          'flex-1 border-l-4 pl-2 text-white/60',
                          positionsData[key].type === 'debt' ? 'border-loss' : 'border-profit',
                        )}
                      >
                        {positionsData[key].amount}
                      </Text>
                    )
                  return (
                    <Text size='xs' key={index} className='flex-1 text-white/60'>
                      {positionsData[key].format && positionsData[key].format === 'number' ? (
                        <FormattedNumber animate {...positionsData[key]} />
                      ) : (
                        positionsData[key]?.amount || ''
                      )}
                    </Text>
                  )
                })}
              </div>
            ))}
        </>
      </div>
    </div>
  )
}
