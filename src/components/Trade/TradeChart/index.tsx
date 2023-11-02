import dynamic from 'next/dynamic'
import Script from 'next/script'
import { useState } from 'react'

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
      {isScriptReady && <TVChartContainer buyAsset={props.buyAsset} sellAsset={props.sellAsset} />}
    </>
  )
}
