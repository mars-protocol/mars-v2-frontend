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

import FormattedNumber from 'components/FormattedNumber'
import Text from 'components/Text'
import useAccountStats from 'hooks/useAccountStats'
import { formatValue } from 'utils/formatters'

const data = [
  {
    date: '2022-12-01',
    risk: 40,
  },
  {
    date: '2022-12-02',
    risk: 78,
  },
  {
    date: '2022-12-03',
    risk: 88,
  },
  {
    date: '2022-12-04',
    risk: 34,
  },
  {
    date: '2022-12-05',
    risk: 43,
  },
  {
    date: '2022-12-06',
    risk: 68,
  },
  {
    date: '2022-12-07',
    risk: 22,
  },
  {
    date: '2022-12-08',
    risk: 67,
  },
  {
    date: '2022-12-09',
    risk: 56,
  },
  {
    date: '2022-12-10',
    risk: 44,
  },
  {
    date: '2022-12-11',
    risk: 11,
  },
]

const RiskChart = () => {
  const accountStats = useAccountStats()
  const currentRisk = accountStats?.risk ?? 0

  return (
    <div className='flex w-full flex-wrap overflow-hidden pt-4 pb-2'>
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
                      <Text size='sm'>{moment(label).format('MM.DD.YYYY')}</Text>
                      <Text size='sm'>Risk: {formatValue(risk, 0, 0, true, false, '%')}</Text>
                    </div>
                  )
                }
              }}
            />
            <Area type='monotone' dataKey='risk' stroke='#FFFFFF' fill='url(#chartGradient)' />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RiskChart
