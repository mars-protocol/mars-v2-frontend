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

import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { formatValue } from 'utils/formatters'

export const RiskChart = ({ data }: RiskChartProps) => {
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const currentRisk = BN_ZERO

  return (
    <div className='flex flex-wrap w-full py-2 overflow-hidden'>
      <FormattedNumber
        className='px-3 pb-2 text-lg'
        amount={currentRisk.multipliedBy(100).toNumber()}
        options={{
          maxDecimals: 0,
          minDecimals: 0,
          prefix: 'Risk score: ',
          suffix: '/100',
        }}
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
                      <Text size='sm'>
                        Risk: {formatValue(risk, { minDecimals: 0, maxDecimals: 0, suffix: '%' })}
                      </Text>
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
              isAnimationActive={!reduceMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
