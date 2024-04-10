import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import Card from './common/Card'

import useManagedVaultApy from '../hooks/vaults/useManagedVaultApy'

type Props = {
  address: string
}

export default function ManagedVaultApyChart(props: Props) {
  const { data } = useManagedVaultApy(props.address)

  const [min, max] = useMemo(() => {
    if (!data) return [0, 100]
    const min = data.sort((a: any, b: any) => a.value - b.value)

    return [Math.floor(min[0].value), Math.ceil(min.at(-1).value)]
  }, [data])

  return (
    <Card
      className='flex flex-wrap w-full overflow-hidden gradient-card-content'
      contentClassName='px-4 pb-4 pt-8'
    >
      <div className='h-[400px] w-full'>
        {data && (
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id='unlocked' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={'#7230d6'} stopOpacity={0.2} />
                  <stop offset='100%' stopColor={'#7230d6'} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id='vested' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={'#FFFFFF'} stopOpacity={0.2} />
                  <stop offset='100%' stopColor={'#FFFFFF'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
              <XAxis
                dataKey='name'
                tickLine={false}
                fontSize={10.53}
                stroke='rgba(255, 255, 255, 0.6)'
              />
              <YAxis
                domain={[min, max]}
                startOffset={20}
                tickLine={false}
                fontSize={10.53}
                stroke='rgba(255, 255, 255, 0.6)'
              />
              <Line type='monotone' dataKey='value' stroke='#7230d6' dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
