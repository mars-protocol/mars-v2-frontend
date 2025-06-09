import classNames from 'classnames'
import moment from 'moment'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/chain/useChainConfig'
interface Props {
  height?: string
}

function createLoadingData() {
  const data = []
  const dataValues = [10, 20, 80, 30, 60, 50, 60]
  const startDate = moment().subtract(7, 'days')
  const endDate = moment()
  const days = endDate.diff(startDate, 'days')
  for (let i = 0; i < days; i++) {
    const date = moment(startDate).add(i, 'days')
    data.push({
      date: date.format('YYYY-MM-DD'),
      value: dataValues[i],
    })
  }
  return data
}

export default function PerformanceChartLoading(props: Props) {
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const height = props.height ?? 'h-80'
  const loadingData = createLoadingData()

  return (
    <div className={classNames('-ml-6 ', height, !reduceMotion && 'animate-pulse')}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={loadingData}
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id='chartGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={'#FFF'} stopOpacity={0.3} />
              <stop offset='100%' stopColor={'#FFF'} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke='rgba(255,255,255,0.2)'
            strokeDasharray='6 3'
            syncWithTicks={true}
          />
          <XAxis
            stroke='rgba(255, 255, 255, 0.3)'
            tickFormatter={() => {
              return '...'
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
            stroke='rgba(255, 255, 255, 0.5)'
            tickFormatter={() => {
              return '...'
            }}
          />
          <Area
            type='monotone'
            dataKey='value'
            stroke='rgba(255, 255, 255, 0.3)'
            fill='url(#chartGradient)'
            isAnimationActive={!reduceMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
