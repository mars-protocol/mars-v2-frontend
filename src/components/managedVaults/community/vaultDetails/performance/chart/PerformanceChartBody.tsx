import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import moment from 'moment'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { Circle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import ChartTooltip from 'components/managedVaults/community/vaultDetails/performance/chart/tooltip/ChartTooltip'
import classNames from 'classnames'

interface LineConfig {
  dataKey: string
  color: string
  name: string
  isPercentage?: boolean
  strokeDasharray?: string
}

interface Props {
  data: any[]
  lines: LineConfig[]
  height?: string
  timeframe?: string
}

const TooltipContent = ({ payload, lines }: { payload: any[]; lines: LineConfig[] }) => {
  const uniqueEntries = new Map()

  return payload.map((item, index) => {
    const lineConfig = lines.find((line) => line.dataKey === item.dataKey)

    if (uniqueEntries.has(item.name)) {
      return null
    }
    uniqueEntries.set(item.name, true)

    const value = typeof item.value === 'string' ? parseFloat(item.value) : item.value

    return (
      <div key={index} className='flex items-center gap-1'>
        <Circle className='fill-current h-2 w-2' color={item.color} />
        <Text size='xs'>{item.name}: </Text>
        {lineConfig?.isPercentage ? (
          <FormattedNumber
            amount={value * 100}
            options={{ maxDecimals: 3, minDecimals: 0, suffix: '%' }}
            className='text-xs'
          />
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber('usd', BN(value))}
            className='text-xs'
            showSignPrefix
          />
        )}
      </div>
    )
  })
}

export default function PerformanceChartBody(props: Props) {
  const { data, lines, height = 'h-65', timeframe = '' } = props

  return (
    <div className={classNames('-ml-6', height)}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{
            top: 15,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            {lines.map((lineConfig, index) => (
              <linearGradient
                id={`gradient-${lineConfig.color}`}
                x1='0'
                y1='0'
                x2='0'
                y2='1'
                key={`gradient-${index}`}
              >
                <stop offset='0%' stopColor={lineConfig.color} stopOpacity={0.2} />
                <stop offset='100%' stopColor={lineConfig.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

          {lines.map((lineConfig, index) => (
            <Area
              key={index}
              type='monotone'
              dataKey={lineConfig.dataKey}
              stroke={lineConfig.color}
              fill={`url(#gradient-${lineConfig.color})`}
              name={lineConfig.name}
              strokeWidth={2}
            />
          ))}

          <XAxis
            axisLine={false}
            tickLine={false}
            fontSize={10}
            dataKey='date'
            tickFormatter={(value) => moment(value).format('DD MMM')}
          />
          <YAxis axisLine={false} tickLine={false} fontSize={10} tickCount={6} />
          <Tooltip
            content={
              <ChartTooltip
                active={false}
                payload={[]}
                label={''}
                renderContent={(payload) => <TooltipContent payload={payload} lines={lines} />}
              />
            }
          />
          <CartesianGrid opacity={0.06} vertical={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
