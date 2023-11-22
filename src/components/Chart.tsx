import classNames from 'classnames'
import moment from 'moment'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import Card from 'components/Card'
import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import { formatValue } from 'utils/formatters'

interface Props {
  data: { date: string; value: number }[]
  title: string
}

export default function Chart(props: Props) {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )

  return (
    <Card className='w-full' title={props.title} contentClassName='p-4 pr-0'>
      <div className='-ml-6 h-[400px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={props.data}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id='chartGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={'#AB47BC'} stopOpacity={0.3} />
                <stop offset='100%' stopColor={'#AB47BC'} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              stroke='rgba(255,255,255,0.1)'
              strokeDasharray='6 3'
              syncWithTicks={true}
            />
            <XAxis
              stroke='rgba(255, 255, 255, 0.4)'
              tickFormatter={(value) => {
                return moment(value).format('DD MMM')
              }}
              padding={{ left: 10, right: 20 }}
              axisLine={false}
              tickLine={false}
              fontSize={12}
              dataKey='date'
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              fontSize={12}
              stroke='rgba(255, 255, 255, 0.4)'
              tickFormatter={(value) => {
                return formatValue(value, {
                  minDecimals: 0,
                  maxDecimals: 0,
                  prefix: '$',
                  abbreviated: true,
                })
              }}
            />
            <Tooltip
              cursor={false}
              isAnimationActive={!reduceMotion}
              wrapperStyle={{ outline: 'none' }}
              content={({ payload, label }) => {
                if (payload && payload.length) {
                  const value = Number(payload[0].value) ?? 0
                  return (
                    <div
                      className={classNames(
                        'max-w-[320px] rounded-lg px-4 py-2 isolate bg-black/5 backdrop-blur',
                        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
                      )}
                    >
                      <Text size='sm' className='text-white/60'>
                        {moment(label).format('DD MMM YYYY')}
                      </Text>
                      <Text size='sm'>
                        {formatValue(value, { minDecimals: 0, maxDecimals: 0, prefix: '$' })}
                      </Text>
                    </div>
                  )
                }
              }}
            />
            <Area
              type='monotone'
              dataKey='value'
              stroke='#AB47BC'
              fill='url(#chartGradient)'
              isAnimationActive={!reduceMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
