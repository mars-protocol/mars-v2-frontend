import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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
import ChartTooltip from 'components/managedVaults/vaultDetails/performance/chart/tooltip/ChartTooltip'
import classNames from 'classnames'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { formatValue } from 'utils/formatters'

interface LineConfig {
  dataKey: string
  color: string
  name: string
  isPercentage?: boolean
  isCurrency?: boolean
}

interface Props {
  data: HistoricalVaultChartData[]
  lines: LineConfig[]
  height?: string
}

const TooltipContent = ({ payload, lines }: { payload: any[]; lines: LineConfig[] }) => {
  const uniqueEntries = new Map()

  return payload.map((item, index) => {
    const lineConfig = lines.find((line) => line.dataKey === item.dataKey)

    if (uniqueEntries.has(item.name)) {
      return null
    }
    uniqueEntries.set(item.name, true)

    return (
      <div key={index} className='flex items-center gap-1'>
        <Circle className='fill-current h-2 w-2' color={item.color} />
        <Text size='xs'>{item.name}: </Text>
        {lineConfig?.isPercentage ? (
          <FormattedNumber
            amount={item.value}
            options={{ maxDecimals: 2, minDecimals: 2, suffix: '%' }}
            className='text-xs'
          />
        ) : lineConfig?.isCurrency ? (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(
              'usd',
              BN(item.value).shiftedBy(-PRICE_ORACLE_DECIMALS),
            )}
            options={{ maxDecimals: 2, minDecimals: 2 }}
            className='text-xs'
          />
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber('usd', BN(item.value))}
            options={{ maxDecimals: 2, minDecimals: 2 }}
            className='text-xs'
          />
        )}
      </div>
    )
  })
}

export default function PerformanceChartBody(props: Props) {
  const { data, lines, height = 'h-80' } = props

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
            dy={10}
            stroke='rgba(255, 255, 255, 0.4)'
            padding={{ left: 5, right: 15 }}
            tickFormatter={(value) => moment(value).format('DD MMM')}
            interval={data.length > 10 ? Math.floor(data.length / 8) : 0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={8}
            tickCount={8}
            stroke='rgba(255, 255, 255, 0.4)'
            tickFormatter={(value) => {
              if (lines[0]?.isPercentage) {
                return formatValue(value, {
                  minDecimals: 0,
                  maxDecimals: 0,
                  suffix: '%',
                  abbreviated: true,
                })
              }
              if (lines[0]?.isCurrency) {
                const adjustedValue = BN(value).shiftedBy(-PRICE_ORACLE_DECIMALS).toNumber()
                return formatValue(adjustedValue, {
                  minDecimals: 2,
                  maxDecimals: 2,
                  prefix: '$',
                  abbreviated: true,
                })
              }
              return formatValue(value, {
                minDecimals: 2,
                maxDecimals: 2,
                prefix: '$',
              })
            }}
          />
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
          <ReferenceLine y={0} stroke='rgba(255, 255, 255, 0.1)' strokeWidth={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
