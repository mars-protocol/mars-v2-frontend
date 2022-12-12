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

import { FormattedNumber, Text } from 'components'
import { useAccountStats } from 'hooks/data'
import { useSettings } from 'stores'
import { formatValue } from 'utils/formatters'

export const RiskChart = ({ data }: RiskChartProps) => {
  const animationsEnabled = useSettings((s) => s.animationsEnabled)
  const accountStats = useAccountStats()
  const currentRisk = accountStats?.risk ?? 0

  return (
    <div className='flex w-full flex-wrap overflow-hidden py-2'>
      <FormattedNumber
        className='px-3 pb-2 text-lg'
        amount={currentRisk * 100}
        maxDecimals={0}
        minDecimals={0}
        animate
        prefix='Risk Score: '
        suffix='/100'
      />
      <div className='-ml-6 h-[100px] w-[412px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id='chartGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={'#FFFFFF'} stopOpacity={0.2} />
                <stop offset='100%' stopColor={'#FFFFFF'} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='0'
              horizontalPoints={[0, 20, 40, 60, 80, 100]}
              vertical={false}
              stroke='rgba(255,255,255,0.1)'
            />
            <XAxis
              stroke='rgba(255, 255, 255, 0.6)'
              tickLine={false}
              tickFormatter={(value) => {
                return moment(value).format('DD')
              }}
              fontSize={10.53}
              dataKey='date'
            />
            <YAxis
              ticks={[0, 20, 40, 60, 80, 100]}
              tickLine={false}
              fontSize={10.53}
              stroke='rgba(255, 255, 255, 0.6)'
            />
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              content={({ payload, label }) => {
                if (payload && payload.length) {
                  const risk = Number(payload[0].value) ?? 0
                  return (
                    <div className='max-w-[320px] rounded-lg px-4 py-2 shadow-tooltip gradient-tooltip '>
                      <Text size='sm'>{moment(label).format('MM-DD-YYYY')}</Text>
                      <Text size='sm'>Risk: {formatValue(risk, 0, 0, true, false, '%')}</Text>
                    </div>
                  )
                }
              }}
            />
            <Area
              type='monotone'
              dataKey='risk'
              stroke='#FFFFFF'
              fill='url(#chartGradient)'
              isAnimationActive={animationsEnabled}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
