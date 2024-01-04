import dynamic from 'next/dynamic'
import Script from 'next/script'
import { useState } from 'react'

import Card from 'components/Card'
import { CircularProgress } from 'components/CircularProgress'
import Loading from 'components/Loading'
import Text from 'components/Text'
import PoweredByPyth from 'components/Trade/TradeChart/PoweredByPyth'

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
        onLoad={() => {
          setIsScriptReady(true)
        }}
      />
      {isScriptReady ? (
        <TVChartContainer buyAsset={props.buyAsset} sellAsset={props.sellAsset} />
      ) : (
        <Card
          title={
            <div className='flex items-center w-full bg-white/10'>
              <Text size='lg' className='flex items-center flex-1 p-4 font-semibold'>
                Trading Chart
              </Text>
              <Loading className='h-4 mr-4 w-60' />
            </div>
          }
          contentClassName='px-0.5 pb-0.5 h-full'
          className='h-[70dvh] max-h-[980px] min-h-[560px]'
        >
          <div className='flex items-center justify-center w-full h-[calc(100%-32px)] rounded-b-base bg-chart'>
            <CircularProgress size={60} className='opacity-50' />
          </div>
          <PoweredByPyth />
        </Card>
      )}
    </>
  )
}
