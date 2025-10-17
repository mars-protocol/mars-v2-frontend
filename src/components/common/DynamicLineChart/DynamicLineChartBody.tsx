import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import moment from 'moment'
import { formatValue } from 'utils/formatters'
import ChartLegend from 'components/common/Legend/ChartLegend'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { Circle } from 'components/common/Icons'
import classNames from 'classnames'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import useChainConfig from 'hooks/chain/useChainConfig'
import CustomTooltip from 'components/common/DynamicLineChart/ChartTooltip'

interface LineConfig {
  dataKey: string
  color: string
  name: string
  isPercentage?: boolean
  isCurrency?: boolean
}

interface Props {
  data: MergedChartData[]
  lines: LineConfig[]
  height?: string
  legend?: boolean
  timeframe?: string
  customYAxisDomain?: (values: number[]) => [number, number]
}

interface ChartDataPayloadProps {
  chartType?: string
  color: string
  dataKey: string
  fill: string
  formatter?: string
  hide: boolean
  name: string
  payload: {
    date: string
    value: number
    label: string
    isPercentage?: boolean
  }
  value: string | number
  stroke?: string
  strokeWidth?: number
  type?: string
  unit?: string
}

const TooltipContent = ({
  payload,
  lines,
}: {
  payload: ChartDataPayloadProps[]
  lines: LineConfig[]
}) => {
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
            amount={value}
            options={{
              maxDecimals: Number(item.value) > 100 ? 0 : 2,
              minDecimals: Number(item.value) > 100 ? 0 : 2,
              suffix: '%',
            }}
            className='text-xs'
          />
        ) : lineConfig?.isCurrency ? (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(
              'usd',
              BN(item.value).shiftedBy(-PRICE_ORACLE_DECIMALS),
            )}
            options={{ maxDecimals: 3, minDecimals: 2 }}
            className='text-xs'
          />
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber('usd', BN(item.value))}
            options={{ maxDecimals: 3, minDecimals: 2 }}
            className='text-xs'
          />
        )}
      </div>
    )
  })
}

export default function DynamicLineChartBody(props: Props) {
  const { data, lines, height = 'h-80', timeframe = '', legend = true, customYAxisDomain } = props
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const [theme] = useLocalStorage<string>(
    LocalStorageKeys.THEME,
    getDefaultChainSettings(chainConfig).theme,
  )

  // Theme-aware axis colors
  const axisColor = theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.4)'

  // domain setting for large percentage values and custom domains
  const getYAxisDomain = () => {
    const extractValues = () =>
      data
        .map((item) =>
          lines.map((line) => {
            const value = item[line.dataKey]
            return typeof value === 'string' ? parseFloat(value) : (value as number)
          }),
        )
        .flat()

    // if customYAxisDomain is a function
    if (typeof customYAxisDomain === 'function') {
      return customYAxisDomain(extractValues())
    }

    // Default percentage handling
    if (!lines[0]?.isPercentage) return undefined

    const values = extractValues()
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)

    // Add 10% padding to the domain y-axis
    const padding = (maxValue - minValue) * 0.1
    return [Math.min(0, minValue - padding), maxValue + padding]
  }

  return (
    <div className={classNames('-ml-4', height)}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
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
              dot={false}
              strokeWidth={2}
              isAnimationActive={!reduceMotion}
            />
          ))}

          <XAxis
            axisLine={false}
            tickLine={false}
            fontSize={10}
            padding={{ left: 5, right: 10 }}
            dataKey='date'
            dy={10}
            stroke={axisColor}
            tickFormatter={(value) => {
              if (timeframe === '24') {
                return moment(value).format('HH:mm')
              }
              return moment(value).format('DD MMM')
            }}
            interval={data.length > 10 ? Math.floor(data.length / 7) : 0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={8}
            tickCount={8}
            domain={getYAxisDomain()}
            stroke={axisColor}
            tickFormatter={(value) => {
              if (lines[0]?.isPercentage) {
                return formatValue(value, {
                  minDecimals: Number(value) > 100 ? 0 : 2,
                  maxDecimals: Number(value) > 100 ? 0 : 2,
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
            content={({ active, payload, label }) => (
              <CustomTooltip
                active={active}
                payload={payload as ChartDataPayloadProps[]}
                label={label as string}
                renderContent={(pl) => <TooltipContent payload={pl} lines={lines} />}
              />
            )}
          />
          {legend && (
            <Legend content={<ChartLegend payload={[]} data={data} />} verticalAlign='top' />
          )}
          <CartesianGrid
            opacity={theme === 'light' ? 0.2 : 0.1}
            vertical={false}
            stroke={axisColor}
          />
          <ReferenceLine y={0} stroke={axisColor} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
