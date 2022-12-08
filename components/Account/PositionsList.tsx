import FormattedNumber from 'components/FormattedNumber'
import Text from 'components/Text'
import { ValuesObject } from 'types'

interface Props {
  title: string
  data: ValuesObject[]
  debtData?: ValuesObject[]
}

const PositionList = ({ title, data, debtData }: Props) => {
  const arrayKeys = Object.keys(data[0])

  return (
    <div className='flex w-full flex-wrap'>
      <Text uppercase className='w-full bg-black/20 px-4 py-2 text-white/40'>
        {title}
      </Text>
      <div className='flex w-full flex-wrap'>
        <div className='mb-2 flex w-full border-b border-white/20 bg-black/20 px-4 py-2'>
          {arrayKeys.map((label, index) => (
            <Text key={index} size='xs' uppercase className='flex-1 text-white'>
              {label}
            </Text>
          ))}
        </div>
        {data &&
          data.map((dataEntry) => (
            <div key={dataEntry[arrayKeys[0]]} className='flex w-full px-4 py-2'>
              <Text size='xs' className='flex-1 border-l-4 border-profit pl-2 text-white/60'>
                {dataEntry.format && dataEntry.format === 'number' ? (
                  <FormattedNumber amount={Number(dataEntry?.amount) || 0} animate {...dataEntry} />
                ) : (
                  dataEntry?.amount || ''
                )}
              </Text>
            </div>
          ))}
        {debtData &&
          debtData.map((dataEntry) => (
            <div key={dataEntry[arrayKeys[0]]} className='flex w-full px-4 py-2'>
              <Text size='xs' className='flex-1 border-l-4 border-profit pl-2 text-white/60'>
                {dataEntry.format && dataEntry.format === 'number' ? (
                  <FormattedNumber amount={Number(dataEntry?.amount) || 0} animate {...dataEntry} />
                ) : (
                  dataEntry?.amount || ''
                )}
              </Text>
            </div>
          ))}
      </div>
    </div>
  )
}

export default PositionList
