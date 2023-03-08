import { Suspense } from 'react'

import { Card } from 'components/Card'
import Loading from 'components/Loading'
import { Text } from 'components/Text'

async function Content(props: PageProps) {
  const wallet = props.params.wallet

  return wallet ? (
    <Text size='sm'>{`Order book for ${wallet}`}</Text>
  ) : (
    <Text size='sm' className='w-full text-center'>
      You need to be connected to see the order book
    </Text>
  )
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function OrderBook(props: PageProps) {
  return (
    <Card className='col-span-3' title='Order Book' contentClassName='px-4 py-6'>
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content params={props.params} />
      </Suspense>
    </Card>
  )
}
