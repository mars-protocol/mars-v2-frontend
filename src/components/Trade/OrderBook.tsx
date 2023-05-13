import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'components/Card'
import Loading from 'components/Loading'
import Text from 'components/Text'

function Content() {
  const params = useParams()
  const address = params.address

  return address ? (
    <Text size='sm'>{`Order book for ${address}`}</Text>
  ) : (
    <Text size='sm' className='w-full text-center'>
      You need to be connected to see the order book
    </Text>
  )
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function OrderBook() {
  return (
    <Card className='col-span-3 bg-white/5' title='Order Book' contentClassName='px-4 py-6'>
      <Suspense fallback={<Fallback />}>
        <Content />
      </Suspense>
    </Card>
  )
}
