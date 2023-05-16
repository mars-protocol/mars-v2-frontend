import { Suspense } from 'react'

import Card from 'components/Card'
import Loading from 'components/Loading'
import Text from 'components/Text'

function Content() {
  return <Text size='sm'>Chart view</Text>
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function TradingView() {
  return (
    <Card
      className='col-span-2 h-full bg-white/5'
      title='Trading View'
      contentClassName='px-4 py-6'
    >
      <Suspense fallback={<Fallback />}>
        <Content />
      </Suspense>
    </Card>
  )
}
