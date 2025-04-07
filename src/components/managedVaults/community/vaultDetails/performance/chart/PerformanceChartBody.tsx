import React from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import moment from 'moment'

interface Props {
  data: any[]
  height?: string
  timeframe?: string
}

export default function PerformanceChartBody(props: Props) {
  const { data, height = 'h-65', timeframe = '' } = props

  return (
    <div className={height}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#8884d8' stopOpacity={0.2} />
              <stop offset='100%' stopColor='#8884d8' stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <Area
            type='monotone'
            dataKey='tvl'
            stroke='#8884d8'
            fill='url(#gradient)'
            strokeWidth={2}
          />

          <XAxis dataKey='date' tickFormatter={(value) => moment(value).format('DD MMM')} />
          <YAxis />
          <Tooltip />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
