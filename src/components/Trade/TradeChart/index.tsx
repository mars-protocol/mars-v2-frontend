import dynamic from 'next/dynamic'
import Script from 'next/script'
import { useState } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import Card from 'components/Card'

const TVChartContainer = dynamic(
  () => import('components/Trade/TradeChart/TVChartContainer').then((mod) => mod.TVChartContainer),
  { ssr: false },
)

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function TradeChart(props: Props) {
  const [isScriptReady, setIsScriptReady] = useState(false)

  return (
    <>
      <Script
        src='/datafeeds/udf/dist/bundle.js'
        strategy='lazyOnload'
        onReady={() => {
          setIsScriptReady(true)
        }}
      />
      {isScriptReady ? (
        <TVChartContainer buyAsset={props.buyAsset} sellAsset={props.sellAsset} />
      ) : (
        <Card title='Trading Chart' contentClassName='px-0.5 pb-0.5 h-full'>
          <div className='flex items-center justify-center w-full h-full rounded-b-sm bg-chart'>
            <CircularProgress size={60} className='opacity-50' />
          </div>
        </Card>
      )}
    </>
  )
}
