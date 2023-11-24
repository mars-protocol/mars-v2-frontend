import { useEffect, useState } from 'react'

import Chart from 'components/Chart'

export default function StatsTrading() {
  const [totalSwapVolume, setTotalSwapVolume] = useState<ChartData | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setTotalSwapVolume([
        {
          date: '2023-11-15',
          value: 2501271,
        },
        {
          date: '2023-11-16',
          value: 2804718,
        },
        {
          date: '2023-11-17',
          value: 4901520,
        },
        {
          date: '2023-11-18',
          value: 6500000,
        },
        {
          date: '2023-11-19',
          value: 7486720,
        },
        {
          date: '2023-11-20',
          value: 8412721,
        },
        {
          date: '2023-11-21',
          value: 10432321,
        },
      ])
    }, 6000)
  })

  return <Chart title='Total Swap Volume' data={totalSwapVolume} />
}
